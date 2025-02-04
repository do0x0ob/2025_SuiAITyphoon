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
        photo_blob: String, // blob_id
        detail_blob: String, // blob_id
    }

    // == OTW for display ==
    public struct MOSAICMINT has drop {}

    // == EVENTS ==

    public struct ProfileCreated has copy, drop {
        id: ID,
        owner: address,
    }

    // == INITIALIZATION ==

    fun init(otw: MOSAICMINT, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<Profile>(&publisher, ctx);

        display.add(
            b"link".to_string(),
            b"https://{b36addr}.walrus.site".to_string(),
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
        detail_blob: String,
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
            photo_blob,
            detail_blob,
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

}