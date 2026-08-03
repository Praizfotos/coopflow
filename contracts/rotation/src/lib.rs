use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, Map,
    IntoVal, TryFromVal,
};
use soroban_sdk::storage::{Map as StorageMap, Vec as StorageVec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum RotationError {
    NotAuthorized,
    InvalidAmount,
    InvalidCycle,
    MemberNotFound,
    CycleNotFound,
    AlreadyPaid,
    PaymentFailed,
    ContractPaused,
    InvalidPayoutOrder,
    CycleAlreadyCompleted,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PayoutOrderType {
    Lottery,
    Manual,
    Priority,
    RandomDraw,
    Voting,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct RotationCycle {
    pub id: u64,
    pub cooperative_id: String,
    pub cycle_type: String,
    pub amount: i128,
    pub asset: String,
    pub payout_order_type: PayoutOrderType,
    pub members: Vec<String>,
    pub current_payout_index: u32,
    pub completed: bool,
    pub total_collected: i128,
    pub start_date: u64,
    pub end_date: u64,
    pub payout_history: Vec<PayoutRecord>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct PayoutRecord {
    pub member_id: String,
    pub amount: i128,
    pub asset: String,
    pub payout_at: u64,
    pub cycle_id: u64,
    pub tx_hash: String,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct ManualOrderConfig {
    pub member_ids: Vec<String>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct RotationConfig {
    pub cooperative_id: String,
    pub default_payout_order: PayoutOrderType,
    pub max_cycle_duration_days: u64,
    pub auto_schedule_enabled: bool,
    pub payout_reminder_enabled: bool,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct MemberRotationSummary {
    pub member_id: String,
    pub total_payouts_received: i128,
    pub cycles_won: u32,
    pub total_contributed: i128,
    pub last_payout_date: u64,
    pub next_payout_position: u32,
}

#[contract]
pub trait CoopFlowRotation {
    fn initialize(env: Env, owner: Address, cooperative_id: String, config: RotationConfig);
    fn create_rotation_cycle(env: Env, admin: Address, cooperative_id: String, cycle_type: String, amount: i128, asset: String, payout_order_type: PayoutOrderType, start_date: u64, end_date: u64) -> u64;
    fn add_member_to_cycle(env: Env, admin: Address, cycle_id: u64, member_id: String) -> Result<(), RotationError>;
    fn remove_member_from_cycle(env: Env, admin: Address, cycle_id: u64, member_id: String) -> Result<(), RotationError>;
    fn record_contribution(env: Env, member_id: String, cycle_id: u64, amount: i128, asset: String) -> Result<(), RotationError>;
    fn execute_payout(env: Env, admin: Address, cycle_id: u64) -> Result<(), RotationError>;
    fn get_cycle(env: Env, cycle_id: u64) -> Result<RotationCycle, RotationError>;
    fn get_member_summary(env: Env, member_id: String) -> Result<MemberRotationSummary, RotationError>;
    fn get_payout_history(env: Env, cycle_id: u64) -> Result<Vec<PayoutRecord>, RotationError>;
    fn set_payout_order(env: Env, admin: Address, cycle_id: u64, order_type: PayoutOrderType, manual_order: Vec<String>) -> Result<(), RotationError>;
    fn advance_payout_position(env: Env, admin: Address, cycle_id: u64) -> Result<(), RotationError>;
    fn complete_cycle(env: Env, admin: Address, cycle_id: u64) -> Result<(), RotationError>;
    fn get_active_cycles(env: Env, cooperative_id: String) -> Result<Vec<RotationCycle>, RotationError>;
    fn pause(env: Env, admin: Address) -> Result<(), RotationError>;
    fn unpause(env: Env, admin: Address) -> Result<(), RotationError>;
    fn update_config(env: Env, admin: Address, config: RotationConfig) -> Result<(), RotationError>;
    fn get_total_collected(env: Env, cycle_id: u64) -> Result<i128, RotationError>;
    fn get_next_payout_member(env: Env, cycle_id: u64) -> Result<String, RotationError>;
    fn random_draw(env: Env, cycle_id: u64) -> Result<String, RotationError>;
    fn vote_for_payout_order(env: Env, member_id: String, cycle_id: u64, candidate_order: Vec<String>) -> Result<(), RotationError>;
}

pub struct CoopFlowRotationContract;

impl CoopFlowRotationContract {
    fn owner(env: &Env) -> Address {
        env.storage().instance().get(&Symbol::new(env, "owner")).unwrap()
    }

    fn check_admin(env: &Env, addr: &Address) -> Result<(), RotationError> {
        let owner = Self::owner(env);
        if owner != *addr {
            return Err(RotationError::NotAuthorized);
        }
        Ok(())
    }

    fn next_cycle_id(env: &Env) -> u64 {
        let key = Symbol::new(env, "next_cycle_id");
        let mut id: u64 = env.storage().instance().get(&key).unwrap_or(0);
        id += 1;
        env.storage().instance().set(&key, &id);
        id
    }
}

#[contractimpl]
impl CoopFlowRotation for CoopFlowRotationContract {
    fn initialize(env: Env, owner: Address, cooperative_id: String, config: RotationConfig) {
        owner.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "owner"), &owner);
        env.storage().instance().set(&Symbol::new(&env, "coop_id"), &cooperative_id);
        env.storage().instance().set(&Symbol::new(&env, "config"), &config);

        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, RotationCycle> = StorageMap::new(&env);
        env.storage().instance().set(&cycles_key, &cycles);

        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, MemberRotationSummary> = StorageMap::new(&env);
        env.storage().instance().set(&members_key, &members);

        env.events().publish(("initialize",), (owner, cooperative_id));
    }

    fn create_rotation_cycle(env: Env, admin: Address, cooperative_id: String, cycle_type: String, amount: i128, asset: String, payout_order_type: PayoutOrderType, start_date: u64, end_date: u64) -> u64 {
        Self::check_admin(&env, &admin)?;
        if amount <= 0 {
            panic!("Invalid amount");
        }

        let cycle_id = Self::next_cycle_id(&env);
        let cycle = RotationCycle {
            id: cycle_id,
            cooperative_id,
            cycle_type,
            amount,
            asset,
            payout_order_type,
            members: Vec::new(&env),
            current_payout_index: 0,
            completed: false,
            total_collected: 0,
            start_date,
            end_date,
            payout_history: Vec::new(&env),
        };

        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        env.events().publish(("cycle_created",), (cycle_id, admin));
        Ok(cycle_id)
    }

    fn add_member_to_cycle(env: Env, admin: Address, cycle_id: u64, member_id: String) -> Result<(), RotationError> {
        Self::check_admin(&env, &admin)?;
        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(RotationError::CycleNotFound),
        };

        let mut members = cycle.members;
        members.push_back(&member_id);
        cycle.members = members;
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        let members_key = Symbol::new(&env, "members");
        let mut members_summary: StorageMap<String, MemberRotationSummary> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        let summary = members_summary.get(&member_id).unwrap_or(MemberRotationSummary {
            member_id: member_id.clone(),
            total_payouts_received: 0,
            cycles_won: 0,
            total_contributed: 0,
            last_payout_date: 0,
            next_payout_position: 0,
        });
        members_summary.set(&member_id, summary);
        env.storage().instance().set(&members_key, &members_summary);

        env.events().publish(("member_added_to_cycle",), (cycle_id, member_id));
        Ok(())
    }

    fn remove_member_from_cycle(env: Env, admin: Address, cycle_id: u64, member_id: String) -> Result<(), RotationError> {
        Self::check_admin(&env, &admin)?;
        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(RotationError::CycleNotFound),
        };

        let mut new_members = Vec::new(&env);
        for m in cycle.members.iter() {
            if m != member_id {
                new_members.push_back(&m);
            }
        }
        cycle.members = new_members;
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        env.events().publish(("member_removed_from_cycle",), (cycle_id, member_id));
        Ok(())
    }

    fn record_contribution(env: Env, member_id: String, cycle_id: u64, amount: i128, asset: String) -> Result<(), RotationError> {
        if amount <= 0 {
            return Err(RotationError::InvalidAmount);
        }

        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(RotationError::CycleNotFound),
        };

        if cycle.completed {
            return Err(RotationError::CycleAlreadyCompleted);
        }

        cycle.total_collected += amount;

        let mut members = cycle.members;
        let mut member_found = false;
        for m in members.iter() {
            if m == member_id {
                member_found = true;
                break;
            }
        }
        if !member_found {
            members.push_back(&member_id);
        }
        cycle.members = members;
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        let members_key = Symbol::new(&env, "members");
        let mut members_summary: StorageMap<String, MemberRotationSummary> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        let mut summary = members_summary.get(&member_id).unwrap_or(MemberRotationSummary {
            member_id: member_id.clone(),
            total_payouts_received: 0,
            cycles_won: 0,
            total_contributed: 0,
            last_payout_date: 0,
            next_payout_position: 0,
        });
        summary.total_contributed += amount;
        members_summary.set(&member_id, summary);
        env.storage().instance().set(&members_key, &members_summary);

        env.events().publish(("contribution_recorded",), (member_id, cycle_id, amount, asset));
        Ok(())
    }

    fn execute_payout(env: Env, admin: Address, cycle_id: u64) -> Result<(), RotationError> {
        Self::check_admin(&env, &admin)?;

        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(RotationError::CycleNotFound),
        };

        if cycle.completed {
            return Err(RotationError::CycleAlreadyCompleted);
        }

        let members_count = cycle.members.len();
        if members_count == 0 {
            return Err(RotationError::InvalidPayoutOrder);
        }

        let current_index = cycle.current_payout_index as usize;
        if current_index >= members_count as usize {
            return Err(RotationError::InvalidPayoutOrder);
        }

        let payout_member = cycle.members.get(current_index as u32).unwrap();

        let payout_record = PayoutRecord {
            member_id: payout_member.clone(),
            amount: cycle.amount,
            asset: cycle.asset.clone(),
            payout_at: env.ledger().timestamp(),
            cycle_id,
            tx_hash: env.tx().hash().to_string(),
        };

        let mut payout_history = cycle.payout_history;
        payout_history.push_back(&payout_record);
        cycle.payout_history = payout_history;

        cycle.current_payout_index += 1;
        cycle.total_collected -= cycle.amount;

        let members_key = Symbol::new(&env, "members");
        let mut members_summary: StorageMap<String, MemberRotationSummary> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        let mut summary = members_summary.get(&payout_member).unwrap_or(MemberRotationSummary {
            member_id: payout_member.clone(),
            total_payouts_received: 0,
            cycles_won: 0,
            total_contributed: 0,
            last_payout_date: 0,
            next_payout_position: 0,
        });
        summary.total_payouts_received += cycle.amount;
        summary.cycles_won += 1;
        summary.last_payout_date = env.ledger().timestamp();
        members_summary.set(&payout_member, summary);
        env.storage().instance().set(&members_key, &members_summary);

        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        env.events().publish(("payout_executed",), (cycle_id, payout_member, cycle.amount, cycle.asset));
        Ok(())
    }

    fn get_cycle(env: Env, cycle_id: u64) -> Result<RotationCycle, RotationError> {
        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        match cycles.get(&cycle_id) {
            Some(c) => Ok(c),
            None => Err(RotationError::CycleNotFound),
        }
    }

    fn get_member_summary(env: Env, member_id: String) -> Result<MemberRotationSummary, RotationError> {
        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, MemberRotationSummary> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        match members.get(&member_id) {
            Some(s) => Ok(s),
            None => Err(RotationError::MemberNotFound),
        }
    }

    fn get_payout_history(env: Env, cycle_id: u64) -> Result<Vec<PayoutRecord>, RotationError> {
        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        match cycles.get(&cycle_id) {
            Some(c) => Ok(c.payout_history),
            None => Err(RotationError::CycleNotFound),
        }
    }

    fn set_payout_order(env: Env, admin: Address, cycle_id: u64, order_type: PayoutOrderType, manual_order: Vec<String>) -> Result<(), RotationError> {
        Self::check_admin(&env, &admin)?;
        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(RotationError::CycleNotFound),
        };

        cycle.payout_order_type = order_type;

        if order_type == PayoutOrderType::Manual {
            cycle.members = manual_order;
        }

        cycle.current_payout_index = 0;
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        env.events().publish(("payout_order_set",), (cycle_id, admin, order_type));
        Ok(())
    }

    fn advance_payout_position(env: Env, admin: Address, cycle_id: u64) -> Result<(), RotationError> {
        Self::check_admin(&env, &admin)?;
        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(RotationError::CycleNotFound),
        };

        cycle.current_payout_index += 1;
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        env.events().publish(("position_advanced",), (cycle_id, admin));
        Ok(())
    }

    fn complete_cycle(env: Env, admin: Address, cycle_id: u64) -> Result<(), RotationError> {
        Self::check_admin(&env, &admin)?;
        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(RotationError::CycleNotFound),
        };

        cycle.completed = true;
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        env.events().publish(("cycle_completed",), (cycle_id, admin));
        Ok(())
    }

    fn get_active_cycles(env: Env, cooperative_id: String) -> Result<Vec<RotationCycle>, RotationError> {
        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, cycle) in cycles.iter() {
            if cycle.cooperative_id == cooperative_id && !cycle.completed {
                result.push_back(&cycle);
            }
        }
        Ok(result)
    }

    fn pause(env: Env, admin: Address) -> Result<(), RotationError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "paused"), &true);
        env.events().publish(("paused",), (admin,));
        Ok(())
    }

    fn unpause(env: Env, admin: Address) -> Result<(), RotationError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "paused"), &false);
        env.events().publish(("unpaused",), (admin,));
        Ok(())
    }

    fn update_config(env: Env, admin: Address, config: RotationConfig) -> Result<(), RotationError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "config"), &config);
        env.events().publish(("config_updated",), (admin,));
        Ok(())
    }

    fn get_total_collected(env: Env, cycle_id: u64) -> Result<i128, RotationError> {
        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        match cycles.get(&cycle_id) {
            Some(c) => Ok(c.total_collected),
            None => Err(RotationError::CycleNotFound),
        }
    }

    fn get_next_payout_member(env: Env, cycle_id: u64) -> Result<String, RotationError> {
        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        let cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(RotationError::CycleNotFound),
        };

        let index = cycle.current_payout_index as usize;
        let members_count = cycle.members.len();
        if index >= members_count as usize {
            return Err(RotationError::InvalidPayoutOrder);
        }

        Ok(cycle.members.get(index as u32).unwrap())
    }

    fn random_draw(env: Env, cycle_id: u64) -> Result<String, RotationError> {
        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, RotationCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        let cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(RotationError::CycleNotFound),
        };

        let members_count = cycle.members.len();
        if members_count == 0 {
            return Err(RotationError::InvalidPayoutOrder);
        }

        let seed = env.ledger().timestamp();
        let random_index = (seed as usize) % members_count;
        Ok(cycle.members.get(random_index as u32).unwrap())
    }

    fn vote_for_payout_order(env: Env, member_id: String, cycle_id: u64, candidate_order: Vec<String>) -> Result<(), RotationError> {
        let votes_key = Symbol::new(&env, "votes");
        let mut votes: StorageMap<u64, Vec<String>> = env.storage().instance().get(&votes_key).unwrap_or(StorageMap::new(&env));

        let mut vote_list = votes.get(&cycle_id).unwrap_or(Vec::new(&env));
        vote_list.push_back(&member_id);
        votes.set(&cycle_id, vote_list);
        env.storage().instance().set(&votes_key, &votes);

        env.events().publish(("vote_cast",), (member_id, cycle_id));
        Ok(())
    }
}