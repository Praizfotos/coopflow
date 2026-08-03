use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, Map,
    IntoVal, TryFromVal,
};
use soroban_sdk::storage::{Map as StorageMap, Vec as StorageVec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum GovernanceError {
    NotAuthorized,
    ProposalNotFound,
    AlreadyVoted,
    VotingPeriodEnded,
    NotEnoughVotes,
    ProposalAlreadyExecuted,
    ProposalAlreadyExpired,
    ContractPaused,
    InvalidThreshold,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ProposalStatus {
    Active,
    Passed,
    Rejected,
    Executed,
    Expired,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ProposalType {
    Spend,
    MemberApproval,
    MemberRemoval,
    RuleChange,
    Pause,
    Resume,
    Custom,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Proposal {
    pub id: u64,
    pub cooperative_id: String,
    pub proposer: Address,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub status: ProposalStatus,
    pub votes_for: i128,
    pub votes_against: i128,
    pub required_approval_percent: i128,
    pub voting_start: u64,
    pub voting_end: u64,
    pub executed_at: u64,
    pub metadata: Map<String, String>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Vote {
    pub proposal_id: u64,
    pub voter: Address,
    pub vote: bool,
    pub voted_at: u64,
    pub voting_power: i128,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct GovernanceConfig {
    pub cooperative_id: String,
    pub quorum_percent: i128,
    pub required_approval_percent: i128,
    pub voting_period_hours: u64,
    pub proposal_expiration_days: u64,
    pub min_proposal_threshold: i128,
    pub max_proposals_per_member: u32,
    pub execution_delay_seconds: u64,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct MemberVotingPower {
    pub member_id: String,
    pub voting_power: i128,
    pub shares: i128,
    pub joined_at: u64,
}

#[contract]
pub trait CoopFlowGovernance {
    fn initialize(env: Env, owner: Address, cooperative_id: String, config: GovernanceConfig);
    fn create_proposal(env: Env, proposer: Address, cooperative_id: String, title: String, description: String, proposal_type: ProposalType, required_approval_percent: i128, metadata: Map<String, String>) -> u64;
    fn vote(env: Env, voter: Address, proposal_id: u64, vote: bool, voting_power: i128) -> Result<(), GovernanceError>;
    fn execute_proposal(env: Env, executor: Address, proposal_id: u64) -> Result<(), GovernanceError>;
    fn get_proposal(env: Env, proposal_id: u64) -> Result<Proposal, GovernanceError>;
    fn get_vote(env: Env, proposal_id: u64, voter: Address) -> Result<Vote, GovernanceError>;
    fn get_proposal_votes(env: Env, proposal_id: u64) -> Result<Vec<Vote>, GovernanceError>;
    fn get_active_proposals(env: Env, cooperative_id: String) -> Result<Vec<Proposal>, GovernanceError>;
    fn get_member_proposals(env: Env, proposer: Address) -> Result<Vec<Proposal>, GovernanceError>;
    fn update_config(env: Env, admin: Address, config: GovernanceConfig) -> Result<(), GovernanceError>;
    fn pause(env: Env, admin: Address) -> Result<(), GovernanceError>;
    fn unpause(env: Env, admin: Address) -> Result<(), GovernanceError>;
    fn is_paused(env: Env) -> Result<bool, GovernanceError>;
    fn get_voting_power(env: Env, member_id: String) -> Result<i128, GovernanceError>;
    fn set_voting_power(env: Env, admin: Address, member_id: String, voting_power: i128) -> Result<(), GovernanceError>;
    fn get_total_votes_cast(env: Env, proposal_id: u64) -> Result<i128, GovernanceError>;
    fn get_proposals_by_status(env: Env, cooperative_id: String, status: ProposalStatus) -> Result<Vec<Proposal>, GovernanceError>;
    fn calculate_quorum(env: Env, proposal_id: u64) -> Result<i128, GovernanceError>;
}

pub struct CoopFlowGovernanceContract;

impl CoopFlowGovernanceContract {
    fn owner(env: &Env) -> Address {
        env.storage().instance().get(&Symbol::new(env, "owner")).unwrap()
    }

    fn check_admin(env: &Env, addr: &Address) -> Result<(), GovernanceError> {
        let owner = Self::owner(env);
        if owner != *addr {
            return Err(GovernanceError::NotAuthorized);
        }
        Ok(())
    }

    fn next_proposal_id(env: &Env) -> u64 {
        let key = Symbol::new(env, "next_proposal_id");
        let mut id: u64 = env.storage().instance().get(&key).unwrap_or(0);
        id += 1;
        env.storage().instance().set(&key, &id);
        id
    }
}

#[contractimpl]
impl CoopFlowGovernance for CoopFlowGovernanceContract {
    fn initialize(env: Env, owner: Address, cooperative_id: String, config: GovernanceConfig) {
        owner.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "owner"), &owner);
        env.storage().instance().set(&Symbol::new(&env, "coop_id"), &cooperative_id);
        env.storage().instance().set(&Symbol::new(&env, "config"), &config);

        let proposals_key = Symbol::new(&env, "proposals");
        let proposals: StorageMap<u64, Proposal> = StorageMap::new(&env);
        env.storage().instance().set(&proposals_key, &proposals);

        let votes_key = Symbol::new(&env, "votes");
        let votes: StorageMap<u64, Vec<Vote>> = StorageMap::new(&env);
        env.storage().instance().set(&votes_key, &votes);

        let voting_power_key = Symbol::new(&env, "voting_power");
        let voting_power: StorageMap<String, i128> = StorageMap::new(&env);
        env.storage().instance().set(&voting_power_key, &voting_power);

        env.events().publish(("initialize",), (owner, cooperative_id));
    }

    fn create_proposal(env: Env, proposer: Address, cooperative_id: String, title: String, description: String, proposal_type: ProposalType, required_approval_percent: i128, metadata: Map<String, String>) -> u64 {
        proposer.require_auth();

        let config_key = Symbol::new(&env, "config");
        let config: GovernanceConfig = env.storage().instance().get(&config_key).unwrap();

        if config.paused {
            panic!("Contract is paused");
        }

        let proposal_id = Self::next_proposal_id(&env);
        let now = env.ledger().timestamp();

        let proposal = Proposal {
            id: proposal_id,
            cooperative_id,
            proposer: proposer.clone(),
            title,
            description,
            proposal_type,
            status: ProposalStatus::Active,
            votes_for: 0,
            votes_against: 0,
            required_approval_percent,
            voting_start: now,
            voting_end: now + config.voting_period_hours * 3600,
            executed_at: 0,
            metadata,
        };

        let proposals_key = Symbol::new(&env, "proposals");
        let mut proposals: StorageMap<u64, Proposal> = env.storage().instance().get(&proposals_key).unwrap_or(StorageMap::new(&env));
        proposals.set(&proposal_id, proposal);
        env.storage().instance().set(&proposals_key, &proposals);

        env.events().publish(("proposal_created",), (proposal_id, proposer));
        Ok(proposal_id)
    }

    fn vote(env: Env, voter: Address, proposal_id: u64, vote: bool, voting_power: i128) -> Result<(), GovernanceError> {
        voter.require_auth();

        if voting_power <= 0 {
            return Err(GovernanceError::InvalidThreshold);
        }

        let proposals_key = Symbol::new(&env, "proposals");
        let mut proposals: StorageMap<u64, Proposal> = env.storage().instance().get(&proposals_key).unwrap_or(StorageMap::new(&env));

        let mut proposal = match proposals.get(&proposal_id) {
            Some(p) => p,
            None => return Err(GovernanceError::ProposalNotFound),
        };

        if proposal.status != ProposalStatus::Active {
            return Err(GovernanceError::ProposalNotFound);
        }

        let now = env.ledger().timestamp();
        if now > proposal.voting_end {
            proposal.status = ProposalStatus::Expired;
            proposals.set(&proposal_id, proposal.clone());
            env.storage().instance().set(&proposals_key, &proposals);
            return Err(GovernanceError::VotingPeriodEnded);
        }

        let votes_key = Symbol::new(&env, "votes");
        let mut votes: StorageMap<u64, Vec<Vote>> = env.storage().instance().get(&votes_key).unwrap_or(StorageMap::new(&env));
        let mut proposal_votes = votes.get(&proposal_id).unwrap_or(Vec::new(&env));

        for existing_vote in proposal_votes.iter() {
            if existing_vote.voter == voter {
                return Err(GovernanceError::AlreadyVoted);
            }
        }

        let vote_record = Vote {
            proposal_id,
            voter: voter.clone(),
            vote,
            voted_at: now,
            voting_power,
        };

        proposal_votes.push_back(&vote_record);
        votes.set(&proposal_id, proposal_votes);
        env.storage().instance().set(&votes_key, &votes);

        if vote {
            proposal.votes_for += voting_power;
        } else {
            proposal.votes_against += voting_power;
        }

        let total_votes = proposal.votes_for + proposal.votes_against;
        let quorum = config.quorum_percent * total_votes / 100;

        if proposal.votes_for >= quorum && proposal.votes_for * 100 / total_votes >= proposal.required_approval_percent {
            proposal.status = ProposalStatus::Passed;
        }

        proposals.set(&proposal_id, proposal.clone());
        env.storage().instance().set(&proposals_key, &proposals);

        env.events().publish(("vote_cast",), (proposal_id, voter, vote, voting_power));
        Ok(())
    }

    fn execute_proposal(env: Env, executor: Address, proposal_id: u64) -> Result<(), GovernanceError> {
        executor.require_auth();

        let proposals_key = Symbol::new(&env, "proposals");
        let mut proposals: StorageMap<u64, Proposal> = env.storage().instance().get(&proposals_key).unwrap_or(StorageMap::new(&env));

        let mut proposal = match proposals.get(&proposal_id) {
            Some(p) => p,
            None => return Err(GovernanceError::ProposalNotFound),
        };

        if proposal.status != ProposalStatus::Passed {
            return Err(GovernanceError::NotEnoughVotes);
        }

        if proposal.executed_at > 0 {
            return Err(GovernanceError::ProposalAlreadyExecuted);
        }

        let config_key = Symbol::new(&env, "config");
        let config: GovernanceConfig = env.storage().instance().get(&config_key).unwrap();

        let now = env.ledger().timestamp();
        if now < proposal.voting_end + config.execution_delay_seconds {
            return Err(GovernanceError::ProposalAlreadyExecuted);
        }

        proposal.status = ProposalStatus::Executed;
        proposal.executed_at = now;
        proposals.set(&proposal_id, proposal.clone());
        env.storage().instance().set(&proposals_key, &proposals);

        env.events().publish(("proposal_executed",), (proposal_id, executor));
        Ok(())
    }

    fn get_proposal(env: Env, proposal_id: u64) -> Result<Proposal, GovernanceError> {
        let proposals_key = Symbol::new(&env, "proposals");
        let proposals: StorageMap<u64, Proposal> = env.storage().instance().get(&proposals_key).unwrap_or(StorageMap::new(&env));
        match proposals.get(&proposal_id) {
            Some(p) => Ok(p),
            None => Err(GovernanceError::ProposalNotFound),
        }
    }

    fn get_vote(env: Env, proposal_id: u64, voter: Address) -> Result<Vote, GovernanceError> {
        let votes_key = Symbol::new(&env, "votes");
        let votes: StorageMap<u64, Vec<Vote>> = env.storage().instance().get(&votes_key).unwrap_or(StorageMap::new(&env));
        let proposal_votes = match votes.get(&proposal_id) {
            Some(v) => v,
            None => return Err(GovernanceError::ProposalNotFound),
        };

        for vote in proposal_votes.iter() {
            if vote.voter == voter {
                return Ok(vote);
            }
        }

        Err(GovernanceError::ProposalNotFound)
    }

    fn get_proposal_votes(env: Env, proposal_id: u64) -> Result<Vec<Vote>, GovernanceError> {
        let votes_key = Symbol::new(&env, "votes");
        let votes: StorageMap<u64, Vec<Vote>> = env.storage().instance().get(&votes_key).unwrap_or(StorageMap::new(&env));
        match votes.get(&proposal_id) {
            Some(v) => Ok(v),
            None => Err(GovernanceError::ProposalNotFound),
        }
    }

    fn get_active_proposals(env: Env, cooperative_id: String) -> Result<Vec<Proposal>, GovernanceError> {
        let proposals_key = Symbol::new(&env, "proposals");
        let proposals: StorageMap<u64, Proposal> = env.storage().instance().get(&proposals_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, proposal) in proposals.iter() {
            if proposal.cooperative_id == cooperative_id && proposal.status == ProposalStatus::Active {
                result.push_back(&proposal);
            }
        }
        Ok(result)
    }

    fn get_member_proposals(env: Env, proposer: Address) -> Result<Vec<Proposal>, GovernanceError> {
        let proposals_key = Symbol::new(&env, "proposals");
        let proposals: StorageMap<u64, Proposal> = env.storage().instance().get(&proposals_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, proposal) in proposals.iter() {
            if proposal.proposer == proposer {
                result.push_back(&proposal);
            }
        }
        Ok(result)
    }

    fn update_config(env: Env, admin: Address, config: GovernanceConfig) -> Result<(), GovernanceError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "config"), &config);
        env.events().publish(("config_updated",), (admin,));
        Ok(())
    }

    fn pause(env: Env, admin: Address) -> Result<(), GovernanceError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "paused"), &true);
        env.events().publish(("paused",), (admin,));
        Ok(())
    }

    fn unpause(env: Env, admin: Address) -> Result<(), GovernanceError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "paused"), &false);
        env.events().publish(("unpaused",), (admin,));
        Ok(())
    }

    fn is_paused(env: Env) -> Result<bool, GovernanceError> {
        let paused_key = Symbol::new(&env, "paused");
        let paused: bool = env.storage().instance().get(&paused_key).unwrap_or(false);
        Ok(paused)
    }

    fn get_voting_power(env: Env, member_id: String) -> Result<i128, GovernanceError> {
        let voting_power_key = Symbol::new(&env, "voting_power");
        let voting_power: StorageMap<String, i128> = env.storage().instance().get(&voting_power_key).unwrap_or(StorageMap::new(&env));
        match voting_power.get(&member_id) {
            Some(p) => Ok(p),
            None => Ok(0),
        }
    }

    fn set_voting_power(env: Env, admin: Address, member_id: String, voting_power: i128) -> Result<(), GovernanceError> {
        Self::check_admin(&env, &admin)?;
        let voting_power_key = Symbol::new(&env, "voting_power");
        let mut voting_power: StorageMap<String, i128> = env.storage().instance().get(&voting_power_key).unwrap_or(StorageMap::new(&env));
        voting_power.set(&member_id, voting_power);
        env.storage().instance().set(&voting_power_key, &voting_power);
        env.events().publish(("voting_power_set",), (admin, member_id, voting_power));
        Ok(())
    }

    fn get_total_votes_cast(env: Env, proposal_id: u64) -> Result<i128, GovernanceError> {
        let votes_key = Symbol::new(&env, "votes");
        let votes: StorageMap<u64, Vec<Vote>> = env.storage().instance().get(&votes_key).unwrap_or(StorageMap::new(&env));
        let proposal_votes = match votes.get(&proposal_id) {
            Some(v) => v,
            None => return Err(GovernanceError::ProposalNotFound),
        };

        let mut total: i128 = 0;
        for vote in proposal_votes.iter() {
            total += vote.voting_power;
        }
        Ok(total)
    }

    fn get_proposals_by_status(env: Env, cooperative_id: String, status: ProposalStatus) -> Result<Vec<Proposal>, GovernanceError> {
        let proposals_key = Symbol::new(&env, "proposals");
        let proposals: StorageMap<u64, Proposal> = env.storage().instance().get(&proposals_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, proposal) in proposals.iter() {
            if proposal.cooperative_id == cooperative_id && proposal.status == status {
                result.push_back(&proposal);
            }
        }
        Ok(result)
    }

    fn calculate_quorum(env: Env, proposal_id: u64) -> Result<i128, GovernanceError> {
        let proposals_key = Symbol::new(&env, "proposals");
        let proposals: StorageMap<u64, Proposal> = env.storage().instance().get(&proposals_key).unwrap_or(StorageMap::new(&env));
        let proposal = match proposals.get(&proposal_id) {
            Some(p) => p,
            None => return Err(GovernanceError::ProposalNotFound),
        };

        let config_key = Symbol::new(&env, "config");
        let config: GovernanceConfig = env.storage().instance().get(&config_key).unwrap();

        let total_votes = proposal.votes_for + proposal.votes_against;
        let quorum = config.quorum_percent * total_votes / 100;
        Ok(quorum)
    }
}