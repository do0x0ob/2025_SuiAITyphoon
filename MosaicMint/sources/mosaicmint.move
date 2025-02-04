module mosaicmint::mosaicmint {

    use std::string::{ String };
    use mosaicmint::utils::to_b36;
    use sui::{
        event,
        package,
        display,
        table::{ Self, Table },
        kiosk,
    };

    // == CONSTANTS ==

    const VISUALIZATION_SITE: address =
        @0xe85a97a3e07f984c53e1a8a1dc6bd32ebec4e48610b3191e4e2e911eccabcb9b; // TODO: change to real site

    // == ERRORS ==

    // const ENoProfile: u64 = 0;
    const EProfileExist: u64 = 1;
    const ENotOwner: u64 = 2;

    // == STRUCTS ==
    public struct State has key {
        id: UID,
        accounts: Table<address, ID>,
        all_profiles: vector<ID>
    }

    public struct Profile has key, store {
        id: UID,
        owner: address,
        b36addr: String,
        bio: String,
        photo_blob: String, // blob_id
    }

    // == ONE TIME WITNESS ==

    public struct MOSAICMINT has drop {}

    // == EVENTS ==

    public struct ProfileCreated has copy, drop {
        id: ID,
        owner: address,
    }

    public struct ProfileUpdated has copy, drop {
        id: ID,
        owner: address,
    }

    // == INITIALIZATION ==

    fun init(otw: MOSAICMINT, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<Profile>(&publisher, ctx);

        display.add(
            b"link".to_string(),
            b"https://{b36addr}.walrus.site".to_string(), // TODO: this should be the personal page(window) of the owner
        );

        display.add(
            b"photo_blob".to_string(),
            b"https://suimeet.jeffier2015.workers.dev/?blobId={photo_blob}".to_string(), // TODO: change to real photo
        );

        display.add(
            b"walrus site address".to_string(),
            VISUALIZATION_SITE.to_string(), // TODO: change to real visualization site
        );

        display.add(
            b"bio_blob".to_string(),
            b"https://suimeet.jeffier2015.workers.dev/?blobId={detail_blob}".to_string(), // TODO: change to real bio
        );
        
        display.update_version();

        transfer::share_object(State {
            id: object::new(ctx), 
            accounts: table::new(ctx),
            all_profiles: vector::empty(),
        });
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == ENTRY FUNCTIONS ==

    public entry fun create_profile (
        state: &mut State,
        photo_blob: String,
        bio: String,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        assert!(!table::contains(&state.accounts, owner), EProfileExist);

        // create profile NFT
        let uid = object::new(ctx);
        let id = object::uid_to_inner(&uid);
        let address = object::uid_to_address(&uid);
        let b36addr = to_b36(address);  

        let profile = Profile {
            id: uid,
            owner,
            b36addr,
            bio,
            photo_blob,
        };

        let (mut kiosk, cap) = kiosk::new(ctx);
        kiosk::place(&mut kiosk, &cap, profile);
        transfer::public_transfer(cap, ctx.sender());
        transfer::public_share_object(kiosk);

        // update state
        table::add(&mut state.accounts, owner, id);
        vector::push_back(&mut state.all_profiles, id); 

        event::emit(ProfileCreated { id, owner });
    }

    public entry fun update_profile (
        profile: &mut Profile,
        photo_blob: Option<String>,
        bio: Option<String>,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let id = object::uid_to_inner(&profile.id);
        assert!(owner == profile.owner, ENotOwner);
        if (option::is_some(&photo_blob)) {
            profile.photo_blob = option::destroy_some(photo_blob);
        };
        if (option::is_some(&bio)) {
            profile.bio = option::destroy_some(bio);
        };

        event::emit(ProfileUpdated { id, owner });
    }

}