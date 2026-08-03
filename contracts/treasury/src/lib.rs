use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, Map,
    IntoVal, TryFromVal,
};
use soroban_sdk::storage::{Map as StorageMap, Map as StorageMap2, Vec as StorageVec};
use soroban_sdk::storage::types::Map;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TreasuryError {
    NotAuthorized,
    InsufficientBalance,
    InvalidAmount,
    PendingApprovalNotFound,
    AlreadyApproved,
    NotEnoughApprovals,
    AlreadyDeposited,
    AlreadyWithdrawn,
    InvalidCurrency,
    ContractPaused,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TreasuryAction {
    Deposit,
    Withdrawal,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ApprovalStatus {
    Pending,
    Approved,
    Rejected,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct TreasuryBalance {
    pub asset: String,
    pub balance: i128,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct WithdrawalRequest {
    pub id: u64,
    pub from: Address,
    pub to: Address,
    pub amount: i128,
    pub asset: String,
    pub reason: String,
    pub status: ApprovalStatus,
    pub approvals: u32,
    pub required_approvals: u32,
    pub approved_by: Vec<Address>,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct DepositRecord {
    pub id: u64,
    pub from: Address,
    pub amount: i128,
    pub asset: String,
    pub timestamp: u64,
    pub tx_hash: String,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct TransactionRecord {
    pub id: u64,
    pub action: TreasuryAction,
    pub from: Address,
    pub to: Address,
    pub amount: i128,
    pub asset: String,
    pub timestamp: u64,
    pub tx_hash: String,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct TreasuryConfig {
    pub owner: Address,
    pub paused: bool,
    pub withdrawal_threshold: i128,
    pub required_approvals: u32,
    pub supported_assets: Vec<String>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct CooperativeInfo {
    pub id: String,
    pub name: String,
    pub treasury_address: Address,
    pub created_at: u64,
    pub active: bool,
}

#[contract]
pub trait CoopFlowTreasury {
    fn initialize(env: Env, owner: Address, cooperative_id: String, cooperative_name: String);
    fn deposit(env: Env, from: Address, amount: i128, asset: String);
    fn request_withdrawal(env: Env, to: Address, amount: i128, asset: String, reason: String) -> u64;
    fn approve_withdrawal(env: Env, request_id: u64, approver: Address);
    fn reject_withdrawal(env: Env, request_id: u64, rejector: Address);
    fn execute_withdrawal(env: Env, request_id: u64) -> Result<(), TreasuryError>;
    fn get_balance(env: Env, asset: String) -> Result<i128, TreasuryError>;
    fn get_withdrawal_request(env: Env, request_id: u64) -> Result<WithdrawalRequest, TreasuryError>;
    fn get_all_balances(env: Env) -> Result<Vec<TreasuryBalance>, TreasuryError>;
    fn get_transaction_history(env: Env, start: u64, limit: u32) -> Result<Vec<TransactionRecord>, TreasuryError>;
    fn get_deposit_history(env: Env, start: u64, limit: u32) -> Result<Vec<DepositRecord>, TreasuryError>;
    fn pause(env: Env, admin: Address) -> Result<(), TreasuryError>;
    fn unpause(env: Env, admin: Address) -> Result<(), TreasuryError>;
    fn add_supported_asset(env: Env, admin: Address, asset: String) -> Result<(), TreasuryError>;
    fn remove_supported_asset(env: Env, admin: Address, asset: String) -> Result<(), TreasuryError>;
    fn set_withdrawal_threshold(env: Env, admin: Address, threshold: i128) -> Result<(), TreasuryError>;
    fn set_required_approvals(env: Env, admin: Address, count: u32) -> Result<(), TreasuryError>;
    fn is_paused(env: Env) -> Result<bool, TreasuryError>;
    fn get_cooperative_info(env: Env) -> Result<CooperativeInfo, TreasuryError>;
    fn get_total_approvals(env: Env, request_id: u64) -> Result<u32, TreasuryError>;
}

pub struct CoopFlowTreasuryContract;

impl CoopFlowTreasuryContract {
    fn owner(env: &Env) -> Address {
        env.storage().instance().get(&Symbol::new(env, "owner")).unwrap()
    }

    fn is_admin(env: &Env, addr: &Address) -> bool {
        let owner = Self::owner(env);
        owner == *addr
    }

    fn check_admin(env: &Env, addr: &Address) -> Result<(), TreasuryError> {
        if !Self::is_admin(env, addr) {
            return Err(TreasuryError::NotAuthorized);
        }
        Ok(())
    }

    fn next_id(env: &Env) -> u64 {
        let key = Symbol::new(env, "next_tx_id");
        let mut id: u64 = env.storage().instance().get(&key).unwrap_or(0);
        id += 1;
        env.storage().instance().set(&key, &id);
        id
    }
}

#[contractimpl]
impl CoopFlowTreasury for CoopFlowTreasuryContract {
    fn initialize(env: Env, owner: Address, cooperative_id: String, cooperative_name: String) {
        owner.require_auth();
        let key = Symbol::new(&env, "owner");
        env.storage().instance().set(&key, &owner);

        let config_key = Symbol::new(&env, "config");
        let config = TreasuryConfig {
            owner: owner.clone(),
            paused: false,
            withdrawal_threshold: 100_000_00,
            required_approvals: 2,
            supported_assets: Vec::new(&env),
        };
        env.storage().instance().set(&config_key, &config);

        let info_key = Symbol::new(&env, "coop_info");
        let info = CooperativeInfo {
            id: cooperative_id,
            name: cooperative_name,
            treasury_address: env.current_contract_address(),
            created_at: env.ledger().timestamp(),
            active: true,
        };
        env.storage().instance().set(&info_key, &info);

        let next_id_key = Symbol::new(&env, "next_tx_id");
        env.storage().instance().set(&next_id_key, &0u64);

        let next_req_key = Symbol::new(&env, "next_req_id");
        env.storage().instance().set(&next_req_key, &0u64);

        env.events().publish(("initialize",), (owner, cooperative_id, cooperative_name));
    }

    fn deposit(env: Env, from: Address, amount: i128, asset: String) -> Result<(), TreasuryError> {
        if amount <= 0 {
            return Err(TreasuryError::InvalidAmount);
        }
        from.require_auth();

        let config_key = Symbol::new(&env, "config");
        let config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();

        if config.paused {
            return Err(TreasuryError::ContractPaused);
        }

        let supported = &config.supported_assets;
        let mut is_supported = false;
        for a in supported.iter() {
            if a == asset {
                is_supported = true;
                break;
            }
        }
        if !is_supported && !supported.is_empty() {
            return Err(TreasuryError::InvalidCurrency);
        }

        let balance_key = Symbol::new(&env, "balance");
        let mut balances: StorageMap<String, i128> = env.storage().instance().get(&balance_key).unwrap_or(StorageMap::new(&env));

        let current = balances.get(&asset).unwrap_or(0);
        balances.set(&asset, current + amount);
        env.storage().instance().set(&balance_key, &balances);

        let deposit_id = Self::next_id(&env);
        let deposit = DepositRecord {
            id: deposit_id,
            from: from.clone(),
            amount,
            asset: asset.clone(),
            timestamp: env.ledger().timestamp(),
            tx_hash: env.tx().hash().to_string(),
        };

        let deposits_key = Symbol::new(&env, "deposits");
        let mut deposits: StorageVec<DepositRecord> = env.storage().instance().get(&deposits_key).unwrap_or(StorageVec::new(&env));
        deposits.push_back(&deposit);
        env.storage().instance().set(&deposits_key, &deposits);

        let tx_id = Self::next_id(&env);
        let tx = TransactionRecord {
            id: tx_id,
            action: TreasuryAction::Deposit,
            from: from.clone(),
            to: env.current_contract_address(),
            amount,
            asset: asset.clone(),
            timestamp: env.ledger().timestamp(),
            tx_hash: env.tx().hash().to_string(),
        };

        let txs_key = Symbol::new(&env, "transactions");
        let mut txs: StorageVec<TransactionRecord> = env.storage().instance().get(&txs_key).unwrap_or(StorageVec::new(&env));
        txs.push_back(&tx);
        env.storage().instance().set(&txs_key, &txs);

        env.events().publish(("deposit",), (from, amount, asset));
        Ok(())
    }

    fn request_withdrawal(env: Env, to: Address, amount: i128, asset: String, reason: String) -> Result<u64, TreasuryError> {
        if amount <= 0 {
            return Err(TreasuryError::InvalidAmount);
        }
        to.require_auth();

        let config_key = Symbol::new(&env, "config");
        let config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();

        if config.paused {
            return Err(TreasuryError::ContractPaused);
        }

        let balance_key = Symbol::new(&env, "balance");
        let balances: StorageMap<String, i128> = env.storage().instance().get(&balance_key).unwrap_or(StorageMap::new(&env));
        let current_balance = balances.get(&asset).unwrap_or(0);

        if current_balance < amount {
            return Err(TreasuryError::InsufficientBalance);
        }

        let request_id_key = Symbol::new(&env, "next_req_id");
        let mut req_id: u64 = env.storage().instance().get(&request_id_key).unwrap_or(0);
        req_id += 1;
        env.storage().instance().set(&request_id_key, &req_id);

        let request = WithdrawalRequest {
            id: req_id,
            from: env.current_contract_address(),
            to: to.clone(),
            amount,
            asset: asset.clone(),
            reason,
            status: ApprovalStatus::Pending,
            approvals: 0,
            required_approvals: config.required_approvals,
            approved_by: Vec::new(&env),
            created_at: env.ledger().timestamp(),
        };

        let requests_key = Symbol::new(&env, "requests");
        let mut requests: StorageMap<u64, WithdrawalRequest> = env.storage().instance().get(&requests_key).unwrap_or(StorageMap::new(&env));
        requests.set(&req_id, request.clone());
        env.storage().instance().set(&requests_key, &requests);

        env.events().publish(("withdrawal_requested",), (req_id, to, amount, asset));
        Ok(req_id)
    }

    fn approve_withdrawal(env: Env, request_id: u64, approver: Address) -> Result<(), TreasuryError> {
        approver.require_auth();

        let requests_key = Symbol::new(&env, "requests");
        let mut requests: StorageMap<u64, WithdrawalRequest> = env.storage().instance().get(&requests_key).unwrap_or(StorageMap::new(&env));

        let mut request = match requests.get(&request_id) {
            Some(r) => r,
            None => return Err(TreasuryError::PendingApprovalNotFound),
        };

        if request.status != ApprovalStatus::Pending {
            return Err(TreasuryError::AlreadyApproved);
        }

        for addr in request.approved_by.iter() {
            if *addr == approver {
                return Err(TreasuryError::AlreadyApproved);
            }
        }

        let mut approved_by = request.approved_by;
        approved_by.push_back(&approver);
        request.approvals += 1;
        request.approved_by = approved_by;

        if request.approvals >= request.required_approvals {
            request.status = ApprovalStatus::Approved;
        }

        requests.set(&request_id, request.clone());
        env.storage().instance().set(&requests_key, &requests);

        env.events().publish(("withdrawal_approved",), (request_id, approver));
        Ok(())
    }

    fn reject_withdrawal(env: Env, request_id: u64, rejector: Address) -> Result<(), TreasuryError> {
        rejector.require_auth();

        let requests_key = Symbol::new(&env, "requests");
        let mut requests: StorageMap<u64, WithdrawalRequest> = env.storage().instance().get(&requests_key).unwrap_or(StorageMap::new(&env));

        let mut request = match requests.get(&request_id) {
            Some(r) => r,
            None => return Err(TreasuryError::PendingApprovalNotFound),
        };

        if request.status != ApprovalStatus::Pending {
            return Err(TreasuryError::AlreadyApproved);
        }

        request.status = ApprovalStatus::Rejected;
        requests.set(&request_id, request.clone());
        env.storage().instance().set(&requests_key, &requests);

        env.events().publish(("withdrawal_rejected",), (request_id, rejector));
        Ok(())
    }

    fn execute_withdrawal(env: Env, request_id: u64) -> Result<(), TreasuryError> {
        let requests_key = Symbol::new(&env, "requests");
        let mut requests: StorageMap<u64, WithdrawalRequest> = env.storage().instance().get(&requests_key).unwrap_or(StorageMap::new(&env));

        let mut request = match requests.get(&request_id) {
            Some(r) => r,
            None => return Err(TreasuryError::PendingApprovalNotFound),
        };

        if request.status != ApprovalStatus::Approved {
            return Err(TreasuryError::NotAuthorized);
        }

        let config_key = Symbol::new(&env, "config");
        let config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();

        if config.paused {
            return Err(TreasuryError::ContractPaused);
        }

        let balance_key = Symbol::new(&env, "balance");
        let mut balances: StorageMap<String, i128> = env.storage().instance().get(&balance_key).unwrap_or(StorageMap::new(&env));
        let current_balance = balances.get(&request.asset).unwrap_or(0);

        if current_balance < request.amount {
            return Err(TreasuryError::InsufficientBalance);
        }

        balances.set(&request.asset, current_balance - request.amount);
        env.storage().instance().set(&balance_key, &balances);

        request.status = ApprovalStatus::Rejected;
        requests.set(&request_id, request.clone());
        env.storage().instance().set(&requests_key, &requests);

        let tx_id = Self::next_id(&env);
        let tx = TransactionRecord {
            id: tx_id,
            action: TreasuryAction::Withdrawal,
            from: env.current_contract_address(),
            to: request.to.clone(),
            amount: request.amount,
            asset: request.asset.clone(),
            timestamp: env.ledger().timestamp(),
            tx_hash: env.tx().hash().to_string(),
        };

        let txs_key = Symbol::new(&env, "transactions");
        let mut txs: StorageVec<TransactionRecord> = env.storage().instance().get(&txs_key).unwrap_or(StorageVec::new(&env));
        txs.push_back(&tx);
        env.storage().instance().set(&txs_key, &txs);

        env.events().publish(("withdrawal_executed",), (request_id, request.to, request.amount, request.asset));
        Ok(())
    }

    fn get_balance(env: Env, asset: String) -> Result<i128, TreasuryError> {
        let balance_key = Symbol::new(&env, "balance");
        let balances: StorageMap<String, i128> = env.storage().instance().get(&balance_key).unwrap_or(StorageMap::new(&env));
        Ok(balances.get(&asset).unwrap_or(0))
    }

    fn get_withdrawal_request(env: Env, request_id: u64) -> Result<WithdrawalRequest, TreasuryError> {
        let requests_key = Symbol::new(&env, "requests");
        let requests: StorageMap<u64, WithdrawalRequest> = env.storage().instance().get(&requests_key).unwrap_or(StorageMap::new(&env));
        match requests.get(&request_id) {
            Some(r) => Ok(r),
            None => Err(TreasuryError::PendingApprovalNotFound),
        }
    }

    fn get_all_balances(env: Env) -> Result<Vec<TreasuryBalance>, TreasuryError> {
        let balance_key = Symbol::new(&env, "balance");
        let balances: StorageMap<String, i128> = env.storage().instance().get(&balance_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (asset, balance) in balances.iter() {
            result.push_back(&TreasuryBalance { asset, balance });
        }
        Ok(result)
    }

    fn get_transaction_history(env: Env, start: u64, limit: u32) -> Result<Vec<TransactionRecord>, TreasuryError> {
        let txs_key = Symbol::new(&env, "transactions");
        let txs: StorageVec<TransactionRecord> = env.storage().instance().get(&txs_key).unwrap_or(StorageVec::new(&env));
        let len = txs.len();
        let start_idx = if start < len as u64 { start as u32 } else { 0 };
        let end_idx = std::cmp::min(start_idx + limit, len as u32);
        let mut result = Vec::new(&env);
        for i in start_idx..end_idx {
            result.push_back(&txs.get(i as u32).unwrap());
        }
        Ok(result)
    }

    fn get_deposit_history(env: Env, start: u64, limit: u32) -> Result<Vec<DepositRecord>, TreasuryError> {
        let deposits_key = Symbol::new(&env, "deposits");
        let deposits: StorageVec<DepositRecord> = env.storage().instance().get(&deposits_key).unwrap_or(StorageVec::new(&env));
        let len = deposits.len();
        let start_idx = if start < len as u64 { start as u32 } else { 0 };
        let end_idx = std::cmp::min(start_idx + limit, len as u32);
        let mut result = Vec::new(&env);
        for i in start_idx..end_idx {
            result.push_back(&deposits.get(i as u32).unwrap());
        }
        Ok(result)
    }

    fn pause(env: Env, admin: Address) -> Result<(), TreasuryError> {
        Self::check_admin(&env, &admin)?;
        let config_key = Symbol::new(&env, "config");
        let mut config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();
        config.paused = true;
        env.storage().instance().set(&config_key, &config);
        env.events().publish(("paused",), (admin,));
        Ok(())
    }

    fn unpause(env: Env, admin: Address) -> Result<(), TreasuryError> {
        Self::check_admin(&env, &admin)?;
        let config_key = Symbol::new(&env, "config");
        let mut config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();
        config.paused = false;
        env.storage().instance().set(&config_key, &config);
        env.events().publish(("unpaused",), (admin,));
        Ok(())
    }

    fn add_supported_asset(env: Env, admin: Address, asset: String) -> Result<(), TreasuryError> {
        Self::check_admin(&env, &admin)?;
        let config_key = Symbol::new(&env, "config");
        let mut config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();
        let mut supported = config.supported_assets;
        supported.push_back(&asset);
        config.supported_assets = supported;
        env.storage().instance().set(&config_key, &config);
        env.events().publish(("asset_added",), (admin, asset));
        Ok(())
    }

    fn remove_supported_asset(env: Env, admin: Address, asset: String) -> Result<(), TreasuryError> {
        Self::check_admin(&env, &admin)?;
        let config_key = Symbol::new(&env, "config");
        let mut config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();
        let mut supported = config.supported_assets;
        let mut new_supported = Vec::new(&env);
        for a in supported.iter() {
            if a != asset {
                new_supported.push_back(&a);
            }
        }
        config.supported_assets = new_supported;
        env.storage().instance().set(&config_key, &config);
        env.events().publish(("asset_removed",), (admin, asset));
        Ok(())
    }

    fn set_withdrawal_threshold(env: Env, admin: Address, threshold: i128) -> Result<(), TreasuryError> {
        Self::check_admin(&env, &admin)?;
        let config_key = Symbol::new(&env, "config");
        let mut config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();
        config.withdrawal_threshold = threshold;
        env.storage().instance().set(&config_key, &config);
        env.events().publish(("threshold_set",), (admin, threshold));
        Ok(())
    }

    fn set_required_approvals(env: Env, admin: Address, count: u32) -> Result<(), TreasuryError> {
        Self::check_admin(&env, &admin)?;
        let config_key = Symbol::new(&env, "config");
        let mut config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();
        config.required_approvals = count;
        env.storage().instance().set(&config_key, &config);
        env.events().publish(("approvals_set",), (admin, count));
        Ok(())
    }

    fn is_paused(env: Env) -> Result<bool, TreasuryError> {
        let config_key = Symbol::new(&env, "config");
        let config: TreasuryConfig = env.storage().instance().get(&config_key).unwrap();
        Ok(config.paused)
    }

    fn get_cooperative_info(env: Env) -> Result<CooperativeInfo, TreasuryError> {
        let info_key = Symbol::new(&env, "coop_info");
        let info: CooperativeInfo = env.storage().instance().get(&info_key).unwrap();
        Ok(info)
    }

    fn get_total_approvals(env: Env, request_id: u64) -> Result<u32, TreasuryError> {
        let requests_key = Symbol::new(&env, "requests");
        let requests: StorageMap<u64, WithdrawalRequest> = env.storage().instance().get(&requests_key).unwrap_or(StorageMap::new(&env));
        match requests.get(&request_id) {
            Some(r) => Ok(r.approvals),
            None => Err(TreasuryError::PendingApprovalNotFound),
        }
    }
}
