use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, Map,
    IntoVal, TryFromVal,
};
use soroban_sdk::storage::{Map as StorageMap, Vec as StorageVec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum RegistryError {
    NotAuthorized,
    OrganizationNotFound,
    CooperativeNotFound,
    MemberNotFound,
    AlreadyExists,
    InvalidRole,
    ContractPaused,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MemberRole {
    Founder,
    Administrator,
    Treasurer,
    Secretary,
    Auditor,
    Member,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MembershipStatus {
    Active,
    Inactive,
    Suspended,
    Pending,
    Revoked,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Organization {
    pub id: String,
    pub name: String,
    pub description: String,
    pub owner: Address,
    pub created_at: u64,
    pub active: bool,
    pub metadata: Map<String, String>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Cooperative {
    pub id: String,
    pub organization_id: String,
    pub name: String,
    pub description: String,
    pub treasury_address: String,
    pub contribution_contract_address: String,
    pub rotation_contract_address: String,
    pub governance_contract_address: String,
    pub loan_contract_address: String,
    pub created_at: u64,
    pub active: bool,
    pub total_members: u32,
    pub metadata: Map<String, String>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Member {
    pub id: String,
    pub cooperative_id: String,
    pub organization_id: String,
    pub name: String,
    pub email: String,
    pub wallet_address: Address,
    pub role: MemberRole,
    pub status: MembershipStatus,
    pub joined_at: u64,
    pub identity_verified: bool,
    pub metadata: Map<String, String>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct OrganizationConfig {
    pub max_cooperatives: u32,
    pub require_identity_verification: bool,
    pub default_role: MemberRole,
    pub auto_approve_members: bool,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct CooperativeConfig {
    pub max_members: u32,
    pub require_approval: bool,
    pub min_members: u32,
    pub max_members_per_cooperative: u32,
}

#[contract]
pub trait CoopFlowRegistry {
    fn initialize(env: Env, owner: Address);
    fn create_organization(env: Env, owner: Address, name: String, description: String, metadata: Map<String, String>) -> String;
    fn create_cooperative(env: Env, admin: Address, organization_id: String, name: String, description: String, metadata: Map<String, String>) -> String;
    fn add_member(env: Env, admin: Address, cooperative_id: String, member_id: String, name: String, email: String, wallet_address: Address, role: MemberRole) -> Result<(), RegistryError>;
    fn remove_member(env: Env, admin: Address, cooperative_id: String, member_id: String) -> Result<(), RegistryError>;
    fn update_member_role(env: Env, admin: Address, cooperative_id: String, member_id: String, role: MemberRole) -> Result<(), RegistryError>;
    fn update_member_status(env: Env, admin: Address, cooperative_id: String, member_id: String, status: MembershipStatus) -> Result<(), RegistryError>;
    fn get_organization(env: Env, org_id: String) -> Result<Organization, RegistryError>;
    fn get_cooperative(env: Env, coop_id: String) -> Result<Cooperative, RegistryError>;
    fn get_member(env: Env, member_id: String) -> Result<Member, RegistryError>;
    fn get_cooperative_members(env: Env, cooperative_id: String) -> Result<Vec<Member>, RegistryError>;
    fn get_organization_cooperatives(env: Env, org_id: String) -> Result<Vec<Cooperative>, RegistryError>;
    fn get_member_cooperatives(env: Env, member_id: String) -> Result<Vec<Member>, RegistryError>;
    fn update_organization(env: Env, owner: Address, org_id: String, name: String, description: String) -> Result<(), RegistryError>;
    fn update_cooperative(env: Env, admin: Address, coop_id: String, name: String, description: String) -> Result<(), RegistryError>;
    fn verify_member_identity(env: Env, admin: Address, cooperative_id: String, member_id: String) -> Result<(), RegistryError>;
    fn pause(env: Env, admin: Address) -> Result<(), RegistryError>;
    fn unpause(env: Env, admin: Address) -> Result<(), RegistryError>;
    fn is_paused(env: Env) -> Result<bool, RegistryError>;
    fn get_total_members(env: Env, cooperative_id: String) -> Result<u32, RegistryError>;
    fn get_active_members(env: Env, cooperative_id: String) -> Result<Vec<Member>, RegistryError>;
    fn get_members_by_role(env: Env, cooperative_id: String, role: MemberRole) -> Result<Vec<Member>, RegistryError>;
    fn update_config(env: Env, admin: Address, config: OrganizationConfig) -> Result<(), RegistryError>;
}

pub struct CoopFlowRegistryContract;

impl CoopFlowRegistryContract {
    fn owner(env: &Env) -> Address {
        env.storage().instance().get(&Symbol::new(env, "owner")).unwrap()
    }

    fn check_admin(env: &Env, addr: &Address) -> Result<(), RegistryError> {
        let owner = Self::owner(env);
        if owner != *addr {
            return Err(RegistryError::NotAuthorized);
        }
        Ok(())
    }
}

#[contractimpl]
impl CoopFlowRegistry for CoopFlowRegistryContract {
    fn initialize(env: Env, owner: Address) {
        owner.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "owner"), &owner);

        let orgs_key = Symbol::new(&env, "organizations");
        let orgs: StorageMap<String, Organization> = StorageMap::new(&env);
        env.storage().instance().set(&orgs_key, &orgs);

        let coops_key = Symbol::new(&env, "cooperatives");
        let coops: StorageMap<String, Cooperative> = StorageMap::new(&env);
        env.storage().instance().set(&coops_key, &coops);

        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, Member> = StorageMap::new(&env);
        env.storage().instance().set(&members_key, &members);

        let org_coops_key = Symbol::new(&env, "org_coops");
        let org_coops: StorageMap<String, Vec<String>> = StorageMap::new(&env);
        env.storage().instance().set(&org_coops_key, &org_coops);

        let coop_members_key = Symbol::new(&env, "coop_members");
        let coop_members: StorageMap<String, Vec<String>> = StorageMap::new(&env);
        env.storage().instance().set(&coop_members_key, &coop_members);

        let member_coops_key = Symbol::new(&env, "member_coops");
        let member_coops: StorageMap<String, Vec<String>> = StorageMap::new(&env);
        env.storage().instance().set(&member_coops_key, &member_coops);

        env.events().publish(("initialize",), (owner,));
    }

    fn create_organization(env: Env, owner: Address, name: String, description: String, metadata: Map<String, String>) -> String {
        owner.require_auth();

        let org_id = format!("org-{}", env.ledger().timestamp());
        let now = env.ledger().timestamp();

        let org = Organization {
            id: org_id.clone(),
            name,
            description,
            owner: owner.clone(),
            created_at: now,
            active: true,
            metadata,
        };

        let orgs_key = Symbol::new(&env, "organizations");
        let mut orgs: StorageMap<String, Organization> = env.storage().instance().get(&orgs_key).unwrap_or(StorageMap::new(&env));
        orgs.set(&org_id, org);
        env.storage().instance().set(&orgs_key, &orgs);

        env.events().publish(("organization_created",), (org_id.clone(), owner));
        Ok(org_id)
    }

    fn create_cooperative(env: Env, admin: Address, organization_id: String, name: String, description: String, metadata: Map<String, String>) -> String {
        admin.require_auth();

        let orgs_key = Symbol::new(&env, "organizations");
        let orgs: StorageMap<String, Organization> = env.storage().instance().get(&orgs_key).unwrap_or(StorageMap::new(&env));
        let org = match orgs.get(&organization_id) {
            Some(o) => o,
            None => panic!("Organization not found"),
        };

        if org.owner != admin {
            panic!("Not authorized");
        }

        let coop_id = format!("coop-{}", env.ledger().timestamp());
        let now = env.ledger().timestamp();

        let coop = Cooperative {
            id: coop_id.clone(),
            organization_id: organization_id.clone(),
            name,
            description,
            treasury_address: String::from_str(&env, ""),
            contribution_contract_address: String::from_str(&env, ""),
            rotation_contract_address: String::from_str(&env, ""),
            governance_contract_address: String::from_str(&env, ""),
            loan_contract_address: String::from_str(&env, ""),
            created_at: now,
            active: true,
            total_members: 0,
            metadata,
        };

        let coops_key = Symbol::new(&env, "cooperatives");
        let mut coops: StorageMap<String, Cooperative> = env.storage().instance().get(&coops_key).unwrap_or(StorageMap::new(&env));
        coops.set(&coop_id, coop);
        env.storage().instance().set(&coops_key, &coops);

        let mut org_coops = org_coops.get(&organization_id).unwrap_or(Vec::new(&env));
        org_coops.push_back(&coop_id);
        env.storage().instance().set(&Symbol::new(&env, "org_coops"), &org_coops);

        env.events().publish(("cooperative_created",), (coop_id.clone(), admin));
        Ok(coop_id)
    }

    fn add_member(env: Env, admin: Address, cooperative_id: String, member_id: String, name: String, email: String, wallet_address: Address, role: MemberRole) -> Result<(), RegistryError> {
        admin.require_auth();

        let coops_key = Symbol::new(&env, "cooperatives");
        let coops: StorageMap<String, Cooperative> = env.storage().instance().get(&coops_key).unwrap_or(StorageMap::new(&env));
        let coop = match coops.get(&cooperative_id) {
            Some(c) => c,
            None => return Err(RegistryError::CooperativeNotFound),
        };

        if !coop.active {
            return Err(RegistryError::CooperativeNotFound);
        }

        let now = env.ledger().timestamp();
        let member = Member {
            id: member_id.clone(),
            cooperative_id: cooperative_id.clone(),
            organization_id: coop.organization_id.clone(),
            name,
            email,
            wallet_address,
            role,
            status: MembershipStatus::Active,
            joined_at: now,
            identity_verified: false,
            metadata: Map::new(&env),
        };

        let members_key = Symbol::new(&env, "members");
        let mut members: StorageMap<String, Member> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        members.set(&member_id, member);
        env.storage().instance().set(&members_key, &members);

        let mut coop_members = coop_members.get(&cooperative_id).unwrap_or(Vec::new(&env));
        coop_members.push_back(&member_id);
        env.storage().instance().set(&Symbol::new(&env, "coop_members"), &coop_members);

        let mut member_coops = member_coops.get(&member_id).unwrap_or(Vec::new(&env));
        member_coops.push_back(&cooperative_id);
        env.storage().instance().set(&Symbol::new(&env, "member_coops"), &member_coops);

        let mut coop_data = coops.get(&cooperative_id).unwrap();
        coop_data.total_members += 1;
        coops.set(&cooperative_id, coop_data);
        env.storage().instance().set(&coops_key, &coops);

        env.events().publish(("member_added",), (cooperative_id, member_id, role));
        Ok(())
    }

    fn remove_member(env: Env, admin: Address, cooperative_id: String, member_id: String) -> Result<(), RegistryError> {
        admin.require_auth();

        let members_key = Symbol::new(&env, "members");
        let mut members: StorageMap<String, Member> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));

        let mut member = match members.get(&member_id) {
            Some(m) => m,
            None => return Err(RegistryError::MemberNotFound),
        };

        if member.cooperative_id != cooperative_id {
            return Err(RegistryError::MemberNotFound);
        }

        member.status = MembershipStatus::Revoked;
        members.set(&member_id, member);
        env.storage().instance().set(&members_key, &members);

        env.events().publish(("member_removed",), (cooperative_id, member_id));
        Ok(())
    }

    fn update_member_role(env: Env, admin: Address, cooperative_id: String, member_id: String, role: MemberRole) -> Result<(), RegistryError> {
        admin.require_auth();

        let members_key = Symbol::new(&env, "members");
        let mut members: StorageMap<String, Member> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));

        let mut member = match members.get(&member_id) {
            Some(m) => m,
            None => return Err(RegistryError::MemberNotFound),
        };

        if member.cooperative_id != cooperative_id {
            return Err(RegistryError::MemberNotFound);
        }

        member.role = role;
        members.set(&member_id, member);
        env.storage().instance().set(&members_key, &members);

        env.events().publish(("role_updated",), (cooperative_id, member_id, role));
        Ok(())
    }

    fn update_member_status(env: Env, admin: Address, cooperative_id: String, member_id: String, status: MembershipStatus) -> Result<(), RegistryError> {
        admin.require_auth();

        let members_key = Symbol::new(&env, "members");
        let mut members: StorageMap<String, Member> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));

        let mut member = match members.get(&member_id) {
            Some(m) => m,
            None => return Err(RegistryError::MemberNotFound),
        };

        if member.cooperative_id != cooperative_id {
            return Err(RegistryError::MemberNotFound);
        }

        member.status = status;
        members.set(&member_id, member);
        env.storage().instance().set(&members_key, &members);

        env.events().publish(("status_updated",), (cooperative_id, member_id, status));
        Ok(())
    }

    fn get_organization(env: Env, org_id: String) -> Result<Organization, RegistryError> {
        let orgs_key = Symbol::new(&env, "organizations");
        let orgs: StorageMap<String, Organization> = env.storage().instance().get(&orgs_key).unwrap_or(StorageMap::new(&env));
        match orgs.get(&org_id) {
            Some(o) => Ok(o),
            None => Err(RegistryError::OrganizationNotFound),
        }
    }

    fn get_cooperative(env: Env, coop_id: String) -> Result<Cooperative, RegistryError> {
        let coops_key = Symbol::new(&env, "cooperatives");
        let coops: StorageMap<String, Cooperative> = env.storage().instance().get(&coops_key).unwrap_or(StorageMap::new(&env));
        match coops.get(&coop_id) {
            Some(c) => Ok(c),
            None => Err(RegistryError::CooperativeNotFound),
        }
    }

    fn get_member(env: Env, member_id: String) -> Result<Member, RegistryError> {
        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, Member> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        match members.get(&member_id) {
            Some(m) => Ok(m),
            None => Err(RegistryError::MemberNotFound),
        }
    }

    fn get_cooperative_members(env: Env, cooperative_id: String) -> Result<Vec<Member>, RegistryError> {
        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, Member> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, member) in members.iter() {
            if member.cooperative_id == cooperative_id && member.status == MembershipStatus::Active {
                result.push_back(&member);
            }
        }
        Ok(result)
    }

    fn get_organization_cooperatives(env: Env, org_id: String) -> Result<Vec<Cooperative>, RegistryError> {
        let coops_key = Symbol::new(&env, "cooperatives");
        let coops: StorageMap<String, Cooperative> = env.storage().instance().get(&coops_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, coop) in coops.iter() {
            if coop.organization_id == org_id && coop.active {
                result.push_back(&coop);
            }
        }
        Ok(result)
    }

    fn get_member_cooperatives(env: Env, member_id: String) -> Result<Vec<Member>, RegistryError> {
        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, Member> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, member) in members.iter() {
            if member.id == member_id {
                result.push_back(&member);
            }
        }
        Ok(result)
    }

    fn update_organization(env: Env, owner: Address, org_id: String, name: String, description: String) -> Result<(), RegistryError> {
        owner.require_auth();

        let orgs_key = Symbol::new(&env, "organizations");
        let mut orgs: StorageMap<String, Organization> = env.storage().instance().get(&orgs_key).unwrap_or(StorageMap::new(&env));

        let mut org = match orgs.get(&org_id) {
            Some(o) => o,
            None => return Err(RegistryError::OrganizationNotFound),
        };

        if org.owner != owner {
            return Err(RegistryError::NotAuthorized);
        }

        org.name = name;
        org.description = description;
        orgs.set(&org_id, org);
        env.storage().instance().set(&orgs_key, &orgs);

        env.events().publish(("organization_updated",), (org_id, owner));
        Ok(())
    }

    fn update_cooperative(env: Env, admin: Address, coop_id: String, name: String, description: String) -> Result<(), RegistryError> {
        admin.require_auth();

        let coops_key = Symbol::new(&env, "cooperatives");
        let mut coops: StorageMap<String, Cooperative> = env.storage().instance().get(&coops_key).unwrap_or(StorageMap::new(&env));

        let mut coop = match coops.get(&coop_id) {
            Some(c) => c,
            None => return Err(RegistryError::CooperativeNotFound),
        };

        coop.name = name;
        coop.description = description;
        coops.set(&coop_id, coop);
        env.storage().instance().set(&coops_key, &coops);

        env.events().publish(("cooperative_updated",), (coop_id, admin));
        Ok(())
    }

    fn verify_member_identity(env: Env, admin: Address, cooperative_id: String, member_id: String) -> Result<(), RegistryError> {
        admin.require_auth();

        let members_key = Symbol::new(&env, "members");
        let mut members: StorageMap<String, Member> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));

        let mut member = match members.get(&member_id) {
            Some(m) => m,
            None => return Err(RegistryError::MemberNotFound),
        };

        if member.cooperative_id != cooperative_id {
            return Err(RegistryError::MemberNotFound);
        }

        member.identity_verified = true;
        members.set(&member_id, member);
        env.storage().instance().set(&members_key, &members);

        env.events().publish(("identity_verified",), (cooperative_id, member_id));
        Ok(())
    }

    fn pause(env: Env, admin: Address) -> Result<(), RegistryError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "paused"), &true);
        env.events().publish(("paused",), (admin,));
        Ok(())
    }

    fn unpause(env: Env, admin: Address) -> Result<(), RegistryError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "paused"), &false);
        env.events().publish(("unpaused",), (admin,));
        Ok(())
    }

    fn is_paused(env: Env) -> Result<bool, RegistryError> {
        let paused_key = Symbol::new(&env, "paused");
        let paused: bool = env.storage().instance().get(&paused_key).unwrap_or(false);
        Ok(paused)
    }

    fn get_total_members(env: Env, cooperative_id: String) -> Result<u32, RegistryError> {
        let coops_key = Symbol::new(&env, "cooperatives");
        let coops: StorageMap<String, Cooperative> = env.storage().instance().get(&coops_key).unwrap_or(StorageMap::new(&env));
        let coop = match coops.get(&cooperative_id) {
            Some(c) => c,
            None => return Err(RegistryError::CooperativeNotFound),
        };
        Ok(coop.total_members)
    }

    fn get_active_members(env: Env, cooperative_id: String) -> Result<Vec<Member>, RegistryError> {
        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, Member> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, member) in members.iter() {
            if member.cooperative_id == cooperative_id && member.status == MembershipStatus::Active {
                result.push_back(&member);
            }
        }
        Ok(result)
    }

    fn get_members_by_role(env: Env, cooperative_id: String, role: MemberRole) -> Result<Vec<Member>, RegistryError> {
        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, Member> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, member) in members.iter() {
            if member.cooperative_id == cooperative_id && member.role == role && member.status == MembershipStatus::Active {
                result.push_back(&member);
            }
        }
        Ok(result)
    }

    fn update_config(env: Env, admin: Address, config: OrganizationConfig) -> Result<(), RegistryError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "org_config"), &config);
        env.events().publish(("config_updated",), (admin,));
        Ok(())
    }
}