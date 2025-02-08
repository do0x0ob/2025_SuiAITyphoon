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
        settings: String,
        memory: String,
        assets: String,
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
            b"https://memento-os.vercel.app/?blobId={photo_blob}".to_string(), // TODO: change to real photo
        );

        display.add(
            b"memory".to_string(),
            b"https://memento-os.vercel.app/?memoryId={memory_id}".to_string(), // TODO: change to real memory
        );

        display.add(
            b"assets".to_string(),
            b"https://memento-os.vercel.app/?assetsId={assets_id}".to_string(), // TODO: change to real assets
        );

        display.add(
            b"settings".to_string(),
            b"https://memento-os.vercel.app/?settingsId={settings_id}".to_string(), // TODO: change to real settings
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
        settings: String,
        memory: String,
        assets: String,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&state.accounts, ctx.sender()), ERegistered);
        
        let os = OS {
            id: object::new(ctx),
            owner: ctx.sender(),
            username,
            photo_blob,
            settings,
            memory,
            assets,
        };

        let id_copy = object::uid_to_inner(&os.id);
        vector::push_back(&mut state.all_os, id_copy);
        table::add(&mut state.accounts, ctx.sender(), id_copy);
        transfer::public_transfer(os, ctx.sender());
        sui::event::emit(OSRegistered { id: id_copy, owner: ctx.sender(), username });
    }

    public entry fun update_os(
        os: &mut OS,
        username: Option<String>,
        photo_blob: Option<String>,
        settings: Option<String>,
        memory: Option<String>,
        assets: Option<String>,
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
        if (option::is_some(&settings)) {
            os.settings = option::destroy_some(settings);
        };
        if (option::is_some(&memory)) {
            os.memory = option::destroy_some(memory);
        };
        if (option::is_some(&assets)) {
            os.assets = option::destroy_some(assets);
        };
    }
}