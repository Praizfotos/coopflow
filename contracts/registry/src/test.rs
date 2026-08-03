use soroban_sdk::{testutils::*, Address, Env, String, Symbol, Vec, Map, StorageMap, StorageVec};
use coopflow_registry::{CoopFlowRegistry, CoopFlowRegistryContract, RegistryError, MemberRole, MembershipStatus, OrganizationConfig};

fn create_test_env() -> (Env, Address) {
    let env = Env::default();
    let owner = Address::generate(&env);

    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    client.initialize(&owner);

    (env, owner)
}

#[test]
fn test_initialize() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let owner_addr = client.owner().unwrap();
    assert_eq!(owner_addr, owner);
}

#[test]
fn test_create_organization() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "A test organization"), metadata).unwrap();
    assert!(org_id.starts_with("org-"));

    let org = client.get_organization(org_id.clone()).unwrap();
    assert_eq!(org.name, "Test Org");
    assert_eq!(org.owner, owner);
}

#[test]
fn test_create_cooperative() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "Description"), metadata.clone()).unwrap();

    let coop_id = client.create_cooperative(&owner, org_id, &String::from_str(&env, "Test Cooperative"), &String::from_str(&env, "A test cooperative"), metadata).unwrap();
    assert!(coop_id.starts_with("coop-"));

    let coop = client.get_cooperative(coop_id).unwrap();
    assert_eq!(coop.name, "Test Cooperative");
    assert_eq!(coop.total_members, 0);
}

#[test]
fn test_add_member() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "Desc"), metadata.clone()).unwrap();
    let coop_id = client.create_cooperative(&owner, org_id, &String::from_str(&env, "Test Coop"), &String::from_str(&env, "Desc"), metadata).unwrap();

    let wallet = Address::generate(&env);
    client.add_member(&owner, coop_id, String::from_str(&env, "member-001"), &String::from_str(&env, "John Doe"), &String::from_str(&env, "john@example.com"), &wallet, MemberRole::Member).unwrap();

    let member = client.get_member(String::from_str(&env, "member-001")).unwrap();
    assert_eq!(member.name, "John Doe");
    assert_eq!(member.role, MemberRole::Member);
    assert_eq!(member.status, MembershipStatus::Active);
}

#[test]
fn test_remove_member() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "Desc"), metadata.clone()).unwrap();
    let coop_id = client.create_cooperative(&owner, org_id, &String::from_str(&env, "Test Coop"), &String::from_str(&env, "Desc"), metadata).unwrap();

    let wallet = Address::generate(&env);
    client.add_member(&owner, coop_id, String::from_str(&env, "member-001"), &String::from_str(&env, "John Doe"), &String::from_str(&env, "john@example.com"), &wallet, MemberRole::Member).unwrap();
    client.remove_member(&owner, coop_id, String::from_str(&env, "member-001")).unwrap();

    let member = client.get_member(String::from_str(&env, "member-001")).unwrap();
    assert_eq!(member.status, MembershipStatus::Revoked);
}

#[test]
fn test_update_member_role() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "Desc"), metadata.clone()).unwrap();
    let coop_id = client.create_cooperative(&owner, org_id, &String::from_str(&env, "Test Coop"), &String::from_str(&env, "Desc"), metadata).unwrap();

    let wallet = Address::generate(&env);
    client.add_member(&owner, coop_id, String::from_str(&env, "member-001"), &String::from_str(&env, "John Doe"), &String::from_str(&env, "john@example.com"), &wallet, MemberRole::Member).unwrap();
    client.update_member_role(&owner, coop_id, String::from_str(&env, "member-001"), MemberRole::Treasurer).unwrap();

    let member = client.get_member(String::from_str(&env, "member-001")).unwrap();
    assert_eq!(member.role, MemberRole::Treasurer);
}

#[test]
fn test_verify_identity() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "Desc"), metadata.clone()).unwrap();
    let coop_id = client.create_cooperative(&owner, org_id, &String::from_str(&env, "Test Coop"), &String::from_str(&env, "Desc"), metadata).unwrap();

    let wallet = Address::generate(&env);
    client.add_member(&owner, coop_id, String::from_str(&env, "member-001"), &String::from_str(&env, "John Doe"), &String::from_str(&env, "john@example.com"), &wallet, MemberRole::Member).unwrap();
    client.verify_member_identity(&owner, coop_id, String::from_str(&env, "member-001")).unwrap();

    let member = client.get_member(String::from_str(&env, "member-001")).unwrap();
    assert!(member.identity_verified);
}

#[test]
fn test_get_cooperative_members() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "Desc"), metadata.clone()).unwrap();
    let coop_id = client.create_cooperative(&owner, org_id, &String::from_str(&env, "Test Coop"), &String::from_str(&env, "Desc"), metadata).unwrap();

    let wallet1 = Address::generate(&env);
    let wallet2 = Address::generate(&env);
    client.add_member(&owner, coop_id, String::from_str(&env, "member-001"), &String::from_str(&env, "John Doe"), &String::from_str(&env, "john@example.com"), &wallet1, MemberRole::Member).unwrap();
    client.add_member(&owner, coop_id, String::from_str(&env, "member-002"), &String::from_str(&env, "Jane Doe"), &String::from_str(&env, "jane@example.com"), &wallet2, MemberRole::Member).unwrap();

    let members = client.get_cooperative_members(coop_id).unwrap();
    assert_eq!(members.len(), 2);
}

#[test]
fn test_get_active_members() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "Desc"), metadata.clone()).unwrap();
    let coop_id = client.create_cooperative(&owner, org_id, &String::from_str(&env, "Test Coop"), &String::from_str(&env, "Desc"), metadata).unwrap();

    let wallet = Address::generate(&env);
    client.add_member(&owner, coop_id, String::from_str(&env, "member-001"), &String::from_str(&env, "John Doe"), &String::from_str(&env, "john@example.com"), &wallet, MemberRole::Member).unwrap();

    let active = client.get_active_members(coop_id).unwrap();
    assert_eq!(active.len(), 1);
}

#[test]
fn test_get_members_by_role() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "Desc"), metadata.clone()).unwrap();
    let coop_id = client.create_cooperative(&owner, org_id, &String::from_str(&env, "Test Coop"), &String::from_str(&env, "Desc"), metadata).unwrap();

    let wallet1 = Address::generate(&env);
    let wallet2 = Address::generate(&env);
    client.add_member(&owner, coop_id, String::from_str(&env, "member-001"), &String::from_str(&env, "John Doe"), &String::from_str(&env, "john@example.com"), &wallet1, MemberRole::Treasurer).unwrap();
    client.add_member(&owner, coop_id, String::from_str(&env, "member-002"), &String::from_str(&env, "Jane Doe"), &String::from_str(&env, "jane@example.com"), &wallet2, MemberRole::Member).unwrap();

    let treasurers = client.get_members_by_role(coop_id, MemberRole::Treasurer).unwrap();
    assert_eq!(treasurers.len(), 1);
}

#[test]
fn test_get_total_members() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "Desc"), metadata.clone()).unwrap();
    let coop_id = client.create_cooperative(&owner, org_id, &String::from_str(&env, "Test Coop"), &String::from_str(&env, "Desc"), metadata).unwrap();

    let wallet = Address::generate(&env);
    client.add_member(&owner, coop_id, String::from_str(&env, "member-001"), &String::from_str(&env, "John Doe"), &String::from_str(&env, "john@example.com"), &wallet, MemberRole::Member).unwrap();

    let total = client.get_total_members(coop_id).unwrap();
    assert_eq!(total, 1);
}

#[test]
fn test_pause_unpause() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    env.mock_all_auths();
    client.pause(&owner).unwrap();
    assert!(client.is_paused().unwrap());

    client.unpause(&owner).unwrap();
    assert!(!client.is_paused().unwrap());
}

#[test]
fn test_update_organization() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let metadata = Map::new(&env);
    let org_id = client.create_organization(&owner, &String::from_str(&env, "Test Org"), &String::from_str(&env, "Desc"), metadata).unwrap();

    client.update_organization(&owner, org_id.clone(), &String::from_str(&env, "Updated Org"), &String::from_str(&env, "Updated Description")).unwrap();

    let org = client.get_organization(org_id).unwrap();
    assert_eq!(org.name, "Updated Org");
}

#[test]
fn test_unauthorized() {
    let (env, owner) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowRegistryContract);
    let client = CoopFlowRegistryClient::new(&env, &contract_id);

    let non_admin = Address::generate(&env);
    let result = client.pause(&non_admin);
    assert!(result.is_err());
}