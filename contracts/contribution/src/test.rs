use soroban_sdk::{testutils::*, Address, Env, String, Symbol, Vec, StorageMap, StorageVec};
use coopflow_contribution::{CoopFlowContribution, CoopFlowContributionContract, ContributionError, ContributionCycleType, CooperativeConfig, PenaltyConfig};

fn create_test_env() -> (Env, Address, String) {
    let env = Env::default();
    let owner = Address::generate(&env);
    let coop_id = String::from_str(&env, "coop-001");

    let contract_id = env.register_contract(None, CoopFlowContributionContract);
    let client = CoopFlowContributionClient::new(&env, &contract_id);

    let penalty_config = PenaltyConfig {
        late_fee_percent: 500,
        grace_period_days: 3,
        max_penalty: 5000,
    };

    let config = CooperativeConfig {
        cooperative_id: coop_id.clone(),
        default_cycle_type: ContributionCycleType::Weekly,
        default_amount: 10000,
        default_asset: String::from_str(&env, "XLM"),
        penalty_config,
        reminder_enabled: true,
        receipt_enabled: true,
    };

    client.initialize(&owner, &coop_id, &config);

    (env, owner, coop_id)
}

#[test]
fn test_initialize() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowContributionContract);
    let client = CoopFlowContributionClient::new(&env, &contract_id);

    let config_key = Symbol::new(&env, "config");
    let config: CooperativeConfig = env.storage().instance().get(&config_key).unwrap();
    assert_eq!(config.cooperative_id, coop_id);
    assert_eq!(config.default_amount, 10000);
}

#[test]
fn test_create_cycle() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowContributionContract);
    let client = CoopFlowContributionClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_cycle(&owner, &coop_id, ContributionCycleType::Weekly, 10000, &String::from_str(&env, "XLM"), now, now + 604800).unwrap();
    assert_eq!(cycle_id, 1);

    let cycle = client.get_cycle(cycle_id).unwrap();
    assert_eq!(cycle.amount, 10000);
    assert!(!cycle.completed);
}

#[test]
fn test_record_payment() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowContributionContract);
    let client = CoopFlowContributionClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_cycle(&owner, &coop_id, ContributionCycleType::Weekly, 10000, &String::from_str(&env, "XLM"), now, now + 604800).unwrap();

    let member_id = String::from_str(&env, "member-001");
    env.mock_all_auths();
    client.record_payment(&member_id, cycle_id, 10000, &String::from_str(&env, "XLM")).unwrap();

    let summary = client.get_member_summary(member_id.clone()).unwrap();
    assert_eq!(summary.total_contributed, 10000);
}

#[test]
fn test_calculate_penalty() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowContributionContract);
    let client = CoopFlowContributionClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_cycle(&owner, &coop_id, ContributionCycleType::Weekly, 10000, &String::from_str(&env, "XLM"), now, now + 604800).unwrap();

    let member_id = String::from_str(&env, "member-001");
    env.mock_all_auths();
    client.record_payment(&member_id, cycle_id, 10000, &String::from_str(&env, "XLM")).unwrap();

    let penalty = client.calculate_penalty(cycle_id, member_id.clone()).unwrap();
    assert_eq!(penalty, 0);
}

#[test]
fn test_complete_cycle() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowContributionContract);
    let client = CoopFlowContributionClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_cycle(&owner, &coop_id, ContributionCycleType::Weekly, 10000, &String::from_str(&env, "XLM"), now, now + 604800).unwrap();

    client.complete_cycle(&owner, cycle_id).unwrap();

    let cycle = client.get_cycle(cycle_id).unwrap();
    assert!(cycle.completed);
}

#[test]
fn test_get_active_cycles() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowContributionContract);
    let client = CoopFlowContributionClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    client.create_cycle(&owner, &coop_id, ContributionCycleType::Weekly, 10000, &String::from_str(&env, "XLM"), now, now + 604800).unwrap();
    client.create_cycle(&owner, &coop_id, ContributionCycleType::Monthly, 20000, &String::from_str(&env, "XLM"), now, now + 2592000).unwrap();

    let cycles = client.get_active_cycles(coop_id).unwrap();
    assert_eq!(cycles.len(), 2);
}

#[test]
fn test_add_remove_member() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowContributionContract);
    let client = CoopFlowContributionClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_cycle(&owner, &coop_id, ContributionCycleType::Weekly, 10000, &String::from_str(&env, "XLM"), now, now + 604800).unwrap();

    let member_id = String::from_str(&env, "member-001");
    client.add_member_to_cycle(&owner, cycle_id, member_id.clone()).unwrap();

    let cycle = client.get_cycle(cycle_id).unwrap();
    assert_eq!(cycle.members.len(), 1);

    client.remove_member_from_cycle(&owner, cycle_id, member_id).unwrap();
    let cycle = client.get_cycle(cycle_id).unwrap();
    assert_eq!(cycle.members.len(), 0);
}

#[test]
fn test_generate_receipt() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowContributionContract);
    let client = CoopFlowContributionClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_cycle(&owner, &coop_id, ContributionCycleType::Weekly, 10000, &String::from_str(&env, "XLM"), now, now + 604800).unwrap();

    let member_id = String::from_str(&env, "member-001");
    env.mock_all_auths();
    client.record_payment(&member_id, cycle_id, 10000, &String::from_str(&env, "XLM")).unwrap();

    let receipt = client.generate_receipt(1).unwrap();
    assert!(receipt.contains("member-001"));
    assert!(receipt.contains("10000"));
}

#[test]
fn test_unauthorized() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowContributionContract);
    let client = CoopFlowContributionClient::new(&env, &contract_id);

    let non_admin = Address::generate(&env);
    let now = env.ledger().timestamp();
    let result = client.create_cycle(&non_admin, &coop_id, ContributionCycleType::Weekly, 10000, &String::from_str(&env, "XLM"), now, now + 604800);
    assert!(result.is_err());
}
