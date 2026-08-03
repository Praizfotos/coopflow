use soroban_sdk::{testutils::*, Address, Env, String, Symbol, Vec, Map, StorageMap, StorageVec};
use coopflow_treasury::{CoopFlowTreasury, CoopFlowTreasuryContract, TreasuryError, ApprovalStatus, TreasuryConfig, CooperativeInfo};

fn create_test_env() -> (Env, Address, String, String) {
    let env = Env::default();
    let owner = Address::generate(&env);
    let coop_id = String::from_str(&env, "coop-001");
    let coop_name = String::from_str(&env, "Test Cooperative");

    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    client.initialize(&owner, &coop_id, &coop_name);

    (env, owner, coop_id, coop_name)
}

#[test]
fn test_initialize() {
    let (env, owner, coop_id, coop_name) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    let info = client.get_cooperative_info().unwrap();
    assert_eq!(info.id, coop_id);
    assert_eq!(info.name, coop_name);
    assert!(info.active);
}

#[test]
fn test_deposit() {
    let (env, owner, _, _) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    let depositor = Address::generate(&env);
    let asset = String::from_str(&env, "XLM");

    env.mock_all_auths();
    client.deposit(&depositor, 100000, &asset);

    let balance = client.get_balance(asset.clone()).unwrap();
    assert_eq!(balance, 100000);
}

#[test]
fn test_deposit_invalid_amount() {
    let (env, owner, _, _) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    let depositor = Address::generate(&env);
    let asset = String::from_str(&env, "XLM");

    env.mock_all_auths();
    let result = client.deposit(&depositor, 0, &asset);
    assert!(result.is_err());
}

#[test]
fn test_request_withdrawal() {
    let (env, owner, _, _) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    let depositor = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = String::from_str(&env, "XLM");

    env.mock_all_auths();
    client.deposit(&depositor, 100000, &asset);

    let req_id = client.request_withdrawal(&recipient, 50000, &asset, &String::from_str(&env, "emergency")).unwrap();
    assert_eq!(req_id, 1);

    let request = client.get_withdrawal_request(req_id).unwrap();
    assert_eq!(request.amount, 50000);
    assert_eq!(request.status, ApprovalStatus::Pending);
}

#[test]
fn test_approve_withdrawal() {
    let (env, owner, _, _) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    let depositor = Address::generate(&env);
    let recipient = Address::generate(&env);
    let approver = Address::generate(&env);
    let asset = String::from_str(&env, "XLM");

    env.mock_all_auths();
    client.deposit(&depositor, 100000, &asset);
    let req_id = client.request_withdrawal(&recipient, 50000, &asset, &String::from_str(&env, "emergency")).unwrap();
    client.approve_withdrawal(req_id, &approver);

    let request = client.get_withdrawal_request(req_id).unwrap();
    assert_eq!(request.approvals, 1);
}

#[test]
fn test_insufficient_balance() {
    let (env, owner, _, _) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    let depositor = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = String::from_str(&env, "XLM");

    env.mock_all_auths();
    client.deposit(&depositor, 10000, &asset);

    let result = client.request_withdrawal(&recipient, 50000, &asset, &String::from_str(&env, "emergency"));
    assert!(result.is_err());
}

#[test]
fn test_pause_unpause() {
    let (env, owner, _, _) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    assert!(!client.is_paused().unwrap());

    env.mock_all_auths();
    client.pause(&owner);
    assert!(client.is_paused().unwrap());

    client.unpause(&owner);
    assert!(!client.is_paused().unwrap());
}

#[test]
fn test_get_all_balances() {
    let (env, owner, _, _) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    let depositor = Address::generate(&env);
    let asset_xlm = String::from_str(&env, "XLM");
    let asset_usd = String::from_str(&env, "USD");

    env.mock_all_auths();
    client.deposit(&depositor, 100000, &asset_xlm);
    client.deposit(&depositor, 50000, &asset_usd);

    let balances = client.get_all_balances().unwrap();
    assert_eq!(balances.len(), 2);
}

#[test]
fn test_set_required_approvals() {
    let (env, owner, _, _) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    env.mock_all_auths();
    client.set_required_approvals(&owner, 3);

    let config_key = Symbol::new(&env, "config");
    let config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();
    assert_eq!(config.required_approvals, 3);
}

#[test]
fn test_unauthorized() {
    let (env, owner, _, _) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowTreasuryContract);
    let client = CoopFlowTreasuryClient::new(&env, &contract_id);

    let non_admin = Address::generate(&env);
    let result = client.pause(&non_admin);
    assert!(result.is_err());
}
