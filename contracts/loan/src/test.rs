use soroban_sdk::{testutils::*, Address, Env, String, Symbol, Vec, Map, StorageMap, StorageVec};
use coopflow_loan::{CoopFlowLoan, CoopFlowLoanContract, LoanError, LoanStatus, LoanConfig};

fn create_test_env() -> (Env, Address, String) {
    let env = Env::default();
    let owner = Address::generate(&env);
    let coop_id = String::from_str(&env, "coop-001");

    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let config = LoanConfig {
        cooperative_id: coop_id.clone(),
        max_loan_amount: 1000000,
        min_loan_amount: 1000,
        max_interest_rate: 1500,
        min_interest_rate: 0,
        max_term_days: 365,
        min_term_days: 7,
        default_interest_rate: 500,
        defaul_t_grace_period_days: 30,
        require_collateral: false,
        max_collateral_ratio: 15000,
    };

    client.initialize(&owner, &coop_id, &config);

    (env, owner, coop_id)
}

#[test]
fn test_initialize() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let config_key = Symbol::new(&env, "config");
    let config: LoanConfig = env.storage().instance().get(&config_key).unwrap();
    assert_eq!(config.cooperative_id, coop_id);
    assert_eq!(config.max_loan_amount, 1000000);
}

#[test]
fn test_request_loan() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    env.mock_all_auths();
    let loan_id = client.request_loan(&borrower, &coop_id, 50000, &String::from_str(&env, "XLM"), 500, 30, 0, &String::from_str(&env, "XLM"), &String::from_str(&env, "Emergency")).unwrap();
    assert_eq!(loan_id, 1);

    let loan = client.get_loan(loan_id).unwrap();
    assert_eq!(loan.amount, 50000);
    assert_eq!(loan.status, LoanStatus::Pending);
}

#[test]
fn test_approve_loan() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    let approver = Address::generate(&env);
    env.mock_all_auths();
    let loan_id = client.request_loan(&borrower, &coop_id, 50000, &String::from_str(&env, "XLM"), 500, 30, 0, &String::from_str(&env, "XLM"), &String::from_str(&env, "Emergency")).unwrap();

    client.approve_loan(&approver, loan_id).unwrap();

    let loan = client.get_loan(loan_id).unwrap();
    assert_eq!(loan.status, LoanStatus::Approved);
}

#[test]
fn test_reject_loan() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    let approver = Address::generate(&env);
    env.mock_all_auths();
    let loan_id = client.request_loan(&borrower, &coop_id, 50000, &String::from_str(&env, "XLM"), 500, 30, 0, &String::from_str(&env, "XLM"), &String::from_str(&env, "Emergency")).unwrap();

    client.reject_loan(&approver, loan_id).unwrap();

    let loan = client.get_loan(loan_id).unwrap();
    assert_eq!(loan.status, LoanStatus::Rejected);
}

#[test]
fn test_disburse_loan() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    let approver = Address::generate(&env);
    env.mock_all_auths();
    let loan_id = client.request_loan(&borrower, &coop_id, 50000, &String::from_str(&env, "XLM"), 500, 30, 0, &String::from_str(&env, "XLM"), &String::from_str(&env, "Emergency")).unwrap();
    client.approve_loan(&approver, loan_id).unwrap();
    client.disburse_loan(&owner, loan_id).unwrap();

    let loan = client.get_loan(loan_id).unwrap();
    assert_eq!(loan.status, LoanStatus::Active);
    assert_eq!(loan.repayment_schedule.len(), 12);
}

#[test]
fn test_record_repayment() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    let approver = Address::generate(&env);
    env.mock_all_auths();
    let loan_id = client.request_loan(&borrower, &coop_id, 50000, &String::from_str(&env, "XLM"), 500, 30, 0, &String::from_str(&env, "XLM"), &String::from_str(&env, "Emergency")).unwrap();
    client.approve_loan(&approver, loan_id).unwrap();
    client.disburse_loan(&owner, loan_id).unwrap();

    env.mock_all_auths();
    client.record_repayment(&borrower, loan_id, 5000, &String::from_str(&env, "XLM")).unwrap();

    let loan = client.get_loan(loan_id).unwrap();
    assert_eq!(loan.repaid_amount, 5000);
    assert_eq!(loan.remaining_balance, 45000);
}

#[test]
fn test_mark_defaulted() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    let approver = Address::generate(&env);
    env.mock_all_auths();
    let loan_id = client.request_loan(&borrower, &coop_id, 50000, &String::from_str(&env, "XLM"), 500, 30, 0, &String::from_str(&env, "XLM"), &String::from_str(&env, "Emergency")).unwrap();
    client.approve_loan(&approver, loan_id).unwrap();
    client.disburse_loan(&owner, loan_id).unwrap();

    client.mark_defaulted(&owner, loan_id).unwrap();

    let loan = client.get_loan(loan_id).unwrap();
    assert_eq!(loan.status, LoanStatus::Defaulted);
}

#[test]
fn test_get_member_loans() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    let approver = Address::generate(&env);
    env.mock_all_auths();
    let loan_id = client.request_loan(&borrower, &coop_id, 50000, &String::from_str(&env, "XLM"), 500, 30, 0, &String::from_str(&env, "XLM"), &String::from_str(&env, "Emergency")).unwrap();
    client.approve_loan(&approver, loan_id).unwrap();
    client.disburse_loan(&owner, loan_id).unwrap();

    let loans = client.get_member_loans(borrower.to_string()).unwrap();
    assert_eq!(loans.len(), 1);
}

#[test]
fn test_calculate_interest() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    let approver = Address::generate(&env);
    env.mock_all_auths();
    let loan_id = client.request_loan(&borrower, &coop_id, 100000, &String::from_str(&env, "XLM"), 500, 30, 0, &String::from_str(&env, "XLM"), &String::from_str(&env, "Emergency")).unwrap();
    client.approve_loan(&approver, loan_id).unwrap();

    let interest = client.calculate_interest(loan_id).unwrap();
    assert_eq!(interest, 5000);
}

#[test]
fn test_pause_unpause() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    env.mock_all_auths();
    client.pause(&owner).unwrap();
    assert!(client.is_paused().unwrap());

    client.unpause(&owner).unwrap();
    assert!(!client.is_paused().unwrap());
}

#[test]
fn test_unauthorized() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let non_admin = Address::generate(&env);
    let result = client.pause(&non_admin);
    assert!(result.is_err());
}

#[test]
fn test_get_overdue_loans() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    let approver = Address::generate(&env);
    env.mock_all_auths();
    let loan_id = client.request_loan(&borrower, &coop_id, 50000, &String::from_str(&env, "XLM"), 500, 30, 0, &String::from_str(&env, "XLM"), &String::from_str(&env, "Emergency")).unwrap();
    client.approve_loan(&approver, loan_id).unwrap();
    client.disburse_loan(&owner, loan_id).unwrap();

    let overdue = client.get_overdue_loans(coop_id).unwrap();
    assert_eq!(overdue.len(), 1);
}

#[test]
fn test_generate_receipt() {
    let (env, owner, coop_id) = create_test_env();
    let contract_id = env.register_contract(None, CoopFlowLoanContract);
    let client = CoopFlowLoanClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    let approver = Address::generate(&env);
    env.mock_all_auths();
    let loan_id = client.request_loan(&borrower, &coop_id, 50000, &String::from_str(&env, "XLM"), 500, 30, 0, &String::from_str(&env, "XLM"), &String::from_str(&env, "Emergency")).unwrap();
    client.approve_loan(&approver, loan_id).unwrap();
    client.disburse_loan(&owner, loan_id).unwrap();

    let receipt = client.generate_loan_receipt(loan_id, 1).unwrap();
    assert!(receipt.contains("50000"));
}