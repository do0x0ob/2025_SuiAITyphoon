module memento::memento {
    use std::string::{ String };
    use sui::{
        package,
        display,
        event,
        table::{ Self, Table }
    };

    // == ERRORS ==
    
    const ERegistered: u64 = 0;
    
    // == STRUCTS ==

    public struct State has key {
        id: UID,
        accounts: Table<address, ID>,
        all_os: vector<ID>
    }

    public struct OS has key, store {
        id: UID,
        owner: address,
        username: String,
        settings_blob_id: String,
    }

    // == ONE TIME WITNESS ==

    public struct MEMENTO has drop {}

    // == EVENTS ==

    public struct OSMinted has copy, drop {
        id: ID,
        owner: address,
        username: String,
    }

    // == INITIALIZATION ==

    fun init(otw: MEMENTO, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<OS>(&publisher, ctx);

        display.add(
            b"name".to_string(),
            b"Memento OS".to_string()
        );
        display.add(
            b"link".to_string(),
            b"https://memento-os.vercel.app".to_string()
        );
        display.add(
            b"description".to_string(),
            b"Your personal Memento OS on Sui Network".to_string()
        );

        display.update_version();

        transfer::share_object(State {
            id: object::new(ctx),
            accounts: table::new(ctx),
            all_os: vector::empty(),
        });

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // == ENTRY FUNCTIONS ==

    public entry fun mint_os(
        state: &mut State,
        username: String,
        settings_blob: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(!table::contains(&state.accounts, sender), ERegistered);

        let os = OS {
            id: object::new(ctx),
            owner: sender,
            username,
            settings_blob_id: settings_blob,
        };

        let id_copy = object::uid_to_inner(&os.id);
        
        vector::push_back(&mut state.all_os, id_copy);
        table::add(&mut state.accounts, sender, id_copy);
        
        transfer::public_transfer(os, sender);
        
        event::emit(OSMinted { 
            id: id_copy, 
            owner: sender, 
            username 
        });
    }
}