module memento::memento {

    use std::string::{ String };
    //use memento::utils::to_b36;
    use sui::{
        package,
        display,
        table::{ Self, Table }
    };

    // == ERRORS ==

    const ERegistered: u64 = 0;
    const ENotOwner: u64 = 1;
    
    
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
        photo_blob: String,
        memento_blob: String,
        assets_blob: String,
        setting_blob: String,
    }

    // == ONE TIME WITNESS ==

    public struct MEMENTO has drop {}

    // == EVENTS ==

    public struct OSRegistered has copy, drop {
        id: ID,
        owner: address,
        username: String,
    }

    // == INITIALIZATION ==

    fun init(otw: MEMENTO, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<OS>(&publisher, ctx);

        display.add(
            b"link".to_string(),
            b"https://memento-os.vercel.app/".to_string(), // TODO: this should be the personal page(window) of the owner
        );

        display.add(
            b"photo_blob".to_string(),
            b"https://memento-os.vercel.app/?blobId={photo_blob}".to_string(), // TODO: change to real photo blob id
        );

        display.add(
            b"memory".to_string(),
            b"https://memento-os.vercel.app/?memoryId={memory_id}".to_string(), // TODO: change to real memory. or blob id only
        );

        display.add(
            b"assets".to_string(),
            b"https://memento-os.vercel.app/?assetsId={assets_id}".to_string(), // TODO: change to real assets blob id
        );

        display.add(
            b"setting".to_string(),
            b"https://memento-os.vercel.app/?settingId={setting_id}".to_string(), // TODO: change to real settings blob id
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

    public entry fun create_os(
        state: &mut State,
        username: String,
        photo_blob: String,
        setting_blob: String,
        memento_blob: String,
        assets_blob: String,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&state.accounts, ctx.sender()), ERegistered);

        let os = OS {
            id: object::new(ctx),
            owner: ctx.sender(),
            username,
            photo_blob,
            setting_blob,
            memento_blob,
            assets_blob,
        };

        let id_copy = object::uid_to_inner(&os.id);
        vector::push_back(&mut state.all_os, id_copy);
        table::add(&mut state.accounts, ctx.sender(), id_copy);
        transfer::public_transfer(os, ctx.sender());
        sui::event::emit(OSRegistered { id: id_copy, owner: ctx.sender(), username });
    }

    public entry fun update_os_info(
        os: &mut OS,
        username: Option<String>,
        photo_blob: Option<String>,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        assert!(owner == os.owner, ENotOwner);
        if (option::is_some(&username)) {
            os.username = option::destroy_some(username);
        };
        if (option::is_some(&photo_blob)) {
            os.photo_blob = option::destroy_some(photo_blob); 
        };
    }

    //TODO: private function to update the blob ids of the os
}