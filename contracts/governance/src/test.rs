use soroban_sdk::{testutils::*, Address, Env, String, Symbol, Vec, Map, StorageMap, StorageVec};
use coopflow_governance::{CoopFlowGovernance, CoopFlowGovernanceContract, GovernanceError, ProposalStatus, ProposalType, GovernanceConfig};

fn create_test_env() -> (Env, Address, String) {
    let env = Env::default();
    let owner = Address::generate(&env);
    let coop_id = String::from_str(&env, "coop-001");

    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let config = GovernanceConfig {
        cooperative_id: coop_id.clone(),
        quorum_percent: 5000,
        required_approval_percent: 6000,
        voting_period_hours: 24,
        proposal_expiration_days: 7,
        min_proposal_threshold: 1000,
        max_proposals_per_member: 10,
        execution_delay_seconds: 3600,
    };

    client.initialize(&owner, &coop_id, &config);

    (env, owner, coop_id)
}

#[test]
fn test_initialize() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let config_key = Symbol::new(&env, "config");
    let config: GovernanceConfig = env.storage().instance().get(&config_key).unwrap();
    assert_eq!(config.cooperative_id, coop_id);
    assert_eq!(config.required_approval_percent, 6000);
}

#[test]
fn test_create_proposal() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let proposal_id = client.create_proposal(&owner, &coop_id, &String::from_str(&env, "Spend Proposal"), &String::from_str(&env, "Test description"), ProposalType::Spend, 6000, metadata).unwrap();
    assert_eq!(proposal_id, 1);

    let proposal = client.get_proposal(proposal_id).unwrap();
    assert_eq!(proposal.title, "Spend Proposal");
    assert_eq!(proposal.status, ProposalStatus::Active);
}

#[test]
fn test_vote() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let proposal_id = client.create_proposal(&owner, &coop_id, &String::from_str(&env, "Test"), &String::from_str(&env, "Description"), ProposalType::Custom, 5000, metadata).unwrap();

    let voter = Address::generate(&env);
    env.mock_all_auths();
    client.vote(&voter, proposal_id, true, 1000).unwrap();

    let proposal = client.get_proposal(proposal_id).unwrap();
    assert_eq!(proposal.votes_for, 1000);
}

#[test]
fn test_already_voted() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let proposal_id = client.create_proposal(&owner, &coop_id, &String::from_str(&env, "Test"), &String::from_str(&env, "Description"), ProposalType::Custom, 5000, metadata).unwrap();

    let voter = Address::generate(&env);
    env.mock_all_auths();
    client.vote(&voter, proposal_id, true, 1000).unwrap();
    let result = client.vote(&voter, proposal_id, false, 1000);
    assert!(result.is_err());
}

#[test]
fn test_execute_proposal() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let proposal_id = client.create_proposal(&owner, &coop_id, &String::from_str(&env, "Execute Test"), &String::from_str(&env, "Description"), ProposalType::Custom, 1000, metadata).unwrap();

    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);
    env.mock_all_auths();
    client.vote(&voter1, proposal_id, true, 10000).unwrap();
    client.vote(&voter2, proposal_id, true, 10000).unwrap();

    let proposal = client.get_proposal(proposal_id).unwrap();
    assert_eq!(proposal.status, ProposalStatus::Passed);
}

#[test]
fn test_get_active_proposals() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    client.create_proposal(&owner, &coop_id, &String::from_str(&env, "Proposal 1"), &String::from_str(&env, "Desc"), ProposalType::Custom, 5000, metadata.clone()).unwrap();
    client.create_proposal(&owner, &coop_id, &String::from_str(&env, "Proposal 2"), &String::from_str(&env, "Desc"), ProposalType::Custom, 5000, metadata).unwrap();

    let active = client.get_active_proposals(coop_id).unwrap();
    assert_eq!(active.len(), 2);
}

#[test]
fn test_set_voting_power() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let member_id = String::from_str(&env, "member-001");
    env.mock_all_auths();
    client.set_voting_power(&owner, member_id.clone(), 5000).unwrap();

    let power = client.get_voting_power(member_id).unwrap();
    assert_eq!(power, 5000);
}

#[test]
fn test_pause_unpause() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    env.mock_all_auths();
    client.pause(&owner).unwrap();
    assert!(client.is_paused().unwrap());

    client.unpause(&owner).unwrap();
    assert!(!client.is_paused().unwrap());
}

#[test]
fn test_unauthorized() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let non_admin = Address::generate(&env);
    let result = client.pause(&non_admin);
    assert!(result.is_err());
}

#[test]
fn test_get_proposals_by_status() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    client.create_proposal(&owner, &coop_id, &String::from_str(&env, "Active"), &String::from_str(&env, "Desc"), ProposalType::Custom, 5000, metadata.clone()).unwrap();
    client.create_proposal(&owner, &coop_id, &String::from_str(&env, "Another Active"), &String::from_str(&env, "Desc"), ProposalType::Custom, 5000, metadata).unwrap();

    let active = client.get_proposals_by_status(coop_id, ProposalStatus::Active).unwrap();
    assert_eq!(active.len(), 2);
}

#[test]
fn test_calculate_quorum() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowGovernanceContract);
    let client = CoopFlowGovernanceClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let proposal_id = client.create_proposal(&owner, &coop_id, &String::from_str(&env, "Quorum Test"), &String::from_str(&env, "Desc"), ProposalType::Custom, 5000, metadata).unwrap();

    let voter = Address::generate(&env);
    env.mock_all_auths();
    client.vote(&voter, proposal_id, true, 10000).unwrap();

    let quorum = client.calculate_quorum(proposal_id).unwrap();
    assert!(quorum > 0);
}