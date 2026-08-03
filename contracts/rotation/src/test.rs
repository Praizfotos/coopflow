use soroban_sdk::{testutils::*, Address, Env, String, Symbol, Vec, Map, StorageMap, StorageVec};
use coopflow_rotation::{CoopFlowRotation, CoopFlowRotationContract, RotationError, PayoutOrderType, RotationConfig};

fn create_test_env() -> (Env, Address, String) {
    let env = Env::default();
    let owner = Address::generate(&env);
    let coop_id = String::from_str(&env, "coop-001");

    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let config = RotationConfig {
        cooperative_id: coop_id.clone(),
        default_payout_order: PayoutOrderType::Lottery,
        max_cycle_duration_days: 90,
        auto_schedule_enabled: true,
        payout_reminder_enabled: true,
    };

    client.initialize(&owner, &coop_id, &config);

    (env, owner, coop_id)
}

#[test]
fn test_initialize() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let config_key = Symbol::new(&env, "config");
    let config: RotationConfig = env.storage().instance().get(&config_key).unwrap();
    assert_eq!(config.cooperative_id, coop_id);
    assert_eq!(config.default_payout_order, PayoutOrderType::Lottery);
}

#[test]
fn test_create_cycle() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_rotation_cycle(&owner, &coop_id, &String::from_str(&env, "weekly"), 10000, &String::from_str(&env, "XLM"), PayoutOrderType::Lottery, now, now + 604800).unwrap();
    assert_eq!(cycle_id, 1);

    let cycle = client.get_cycle(cycle_id).unwrap();
    assert_eq!(cycle.amount, 10000);
    assert!(!cycle.completed);
}

#[test]
fn test_add_remove_member() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_rotation_cycle(&owner, &coop_id, &String::from_str(&env, "weekly"), 10000, &String::from_str(&env, "XLM"), PayoutOrderType::Lottery, now, now + 604800).unwrap();

    let member_id = String::from_str(&env, "member-001");
    client.add_member_to_cycle(&owner, cycle_id, member_id.clone()).unwrap();

    let cycle = client.get_cycle(cycle_id).unwrap();
    assert_eq!(cycle.members.len(), 1);

    client.remove_member_from_cycle(&owner, cycle_id, member_id).unwrap();
    let cycle = client.get_cycle(cycle_id).unwrap();
    assert_eq!(cycle.members.len(), 0);
}

#[test]
fn test_record_contribution() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_rotation_cycle(&owner, &coop_id, &String::from_str(&env, "weekly"), 10000, &String::from_str(&env, "XLM"), PayoutOrderType::Lottery, now, now + 604800).unwrap();

    let member_id = String::from_str(&env, "member-001");
    env.mock_all_auths();
    client.record_contribution(&member_id, cycle_id, 10000, &String::from_str(&env, "XLM")).unwrap();

    let summary = client.get_member_summary(member_id.clone()).unwrap();
    assert_eq!(summary.total_contributed, 10000);
}

#[test]
fn test_execute_payout() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_rotation_cycle(&owner, &coop_id, &String::from_str(&env, "weekly"), 10000, &String::from_str(&env, "XLM"), PayoutOrderType::Manual, now, now + 604800).unwrap();

    let member1 = String::from_str(&env, "member-001");
    let member2 = String::from_str(&env, "member-002");
    client.add_member_to_cycle(&owner, cycle_id, member1.clone()).unwrap();
    client.add_member_to_cycle(&owner, cycle_id, member2.clone()).unwrap();

    env.mock_all_auths();
    client.record_contribution(&member1, cycle_id, 10000, &String::from_str(&env, "XLM")).unwrap();
    client.record_contribution(&member2, cycle_id, 10000, &String::from_str(&env, "XLM")).unwrap();

    client.execute_payout(&owner, cycle_id).unwrap();

    let summary = client.get_member_summary(member1.clone()).unwrap();
    assert_eq!(summary.total_payouts_received, 10000);
    assert_eq!(summary.cycles_won, 1);
}

#[test]
fn test_random_draw() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_rotation_cycle(&owner, &coop_id, &String::from_str(&env, "weekly"), 10000, &String::from_str(&env, "XLM"), PayoutOrderType::RandomDraw, now, now + 604800).unwrap();

    let member1 = String::from_str(&env, "member-001");
    let member2 = String::from_str(&env, "member-002");
    client.add_member_to_cycle(&owner, cycle_id, member1.clone()).unwrap();
    client.add_member_to_cycle(&owner, cycle_id, member2.clone()).unwrap();

    let winner = client.random_draw(cycle_id).unwrap();
    assert!(winner == member1 || winner == member2);
}

#[test]
fn test_complete_cycle() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_rotation_cycle(&owner, &coop_id, &String::from_str(&env, "weekly"), 10000, &String::from_str(&env, "XLM"), PayoutOrderType::Lottery, now, now + 604800).unwrap();

    client.complete_cycle(&owner, cycle_id).unwrap();

    let cycle = client.get_cycle(cycle_id).unwrap();
    assert!(cycle.completed);
}

#[test]
fn test_get_active_cycles() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    client.create_rotation_cycle(&owner, &coop_id, &String::from_str(&env, "weekly"), 10000, &String::from_str(&env, "XLM"), PayoutOrderType::Lottery, now, now + 604800).unwrap();
    client.create_rotation_cycle(&owner, &coop_id, &String::from_str(&env, "monthly"), 20000, &String::from_str(&env, "XLM"), PayoutOrderType::Lottery, now, now + 2592000).unwrap();

    let cycles = client.get_active_cycles(coop_id).unwrap();
    assert_eq!(cycles.len(), 2);
}

#[test]
fn test_pause_unpause() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    env.mock_all_auths();
    client.pause(&owner).unwrap();

    client.unpause(&owner).unwrap();
}

#[test]
fn test_unauthorized() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let non_admin = Address::generate(&env);
    let now = env.ledger().timestamp();
    let result = client.create_rotation_cycle(&non_admin, &coop_id, &String::from_str(&env, "weekly"), 10000, &String::from_str(&env, "XLM"), PayoutOrderType::Lottery, now, now + 604800);
    assert!(result.is_err());
}

#[test]
fn test_get_next_payout_member() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_rotation_cycle(&owner, &coop_id, &String::from_str(&env, "weekly"), 10000, &String::from_str(&env, "XLM"), PayoutOrderType::Manual, now, now + 604800).unwrap();

    let member1 = String::from_str(&env, "member-001");
    let member2 = String::from_str(&env, "member-002");
    client.add_member_to_cycle(&owner, cycle_id, member1.clone()).unwrap();
    client.add_member_to_cycle(&owner, cycle_id, member2.clone()).unwrap();

    let next = client.get_next_payout_member(cycle_id).unwrap();
    assert_eq!(next, member1);
}

#[test]
fn test_vote_for_payout_order() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRotationContract);
    let client = CoopFlowRotationClient::new(&env, &contract_id);

    let now = env.ledger().timestamp();
    let cycle_id = client.create_rotation_cycle(&owner, &coop_id, &String::from_str(&env, "weekly"), 10000, &String::from_str(&env, "XLM"), PayoutOrderType::Voting, now, now + 604800).unwrap();

    let member_id = String::from_str(&env, "member-001");
    let candidate_order = Vec::new(&env);
    client.vote_for_payout_order(&member_id, cycle_id, candidate_order).unwrap();
}