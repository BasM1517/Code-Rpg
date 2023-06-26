var partylist = ["TacoKite","chestakite","KleptoKite"];
var sell_list = ["helmet","coat","pants","shoes","hpamulet"];
var potionvalue = 300;
var leader = "KleptoKite";
var upgrade_list = ["wshoes","wcap","wbasher"];
var compound_list = ["hpbelt","ringsj","vitearring","intearring","dexearring","strearring","wbook0"];

async function initiate_code() {
        partylist.forEach(element => {
            parent.start_character_runner(element, "FightercodeV2");
        });
        await delay(30000);
	    partylist.forEach(element => {
            send_party_invite(element);
        });

}

setInterval(function(){use_hp_or_mp_own();if(character.rip) {
    target = null;
    respawn(); 
    return;}}, 1000);

function use_hp_or_mp_own(){
    if(!is_on_cooldown("use_hp")){
        if(character.max_mp - character.mp >= potionvalue || character.mp <= 50){
            var used = true;
            use_skill('use_mp');
        }else if(character.max_hp - character.hp >= potionvalue)
        {
            var used = true;
            use_skill('use_hp');
        }
    }
}

function buy_with_gold(name,quantity)
{
	return parent.buy_with_gold(name,quantity); // returns a Promise
}

async function on_cm(name,data)
{
	var ans = data.split(',');
	if(ans[0] == "1"){
		await smart_move("town");
		buy_with_gold("hpot0",ans[3]);
		buy_with_gold("mpot0",ans[4]);
		await smart_move({x:ans[1], y:ans[2], map: ans[5]});
		parent.socket.emit("send", { name: name, num: [0], q: ans[3]});
		parent.socket.emit("send", { name: name, num: [1], q: ans[4]});
    await smart_move("town");
    sell_stuff();
    upgrade_go_trough_array();
	}
}
function locate_item_own(name)
{
	for(var i=0;i<character.items.length;i++)
	{
		if(character.items[i] && character.items[i].name==name) return i;
	}
	console.log("-1")
}
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland

function buy_with_gold(name,quantity)
{
	return parent.buy_with_gold(name,quantity); // returns a Promise
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
function sell_stuff(){
    for (let i in character.items) {
        let slot = character.items[i];
        if (slot != null) {
            let slot = character.items[i].name;
            if (sell_list.includes(slot)) {
                sell([i],character.items[1].q)
            }
        }
    }
}

function locate_item_array(name, slot) {
    for (var i = 0; i < character.items.length; i++) {
      if (character.items[slot] && character.items[slot].name === name
        ) {
        return { item_info: character.items[slot], slot_info: slot };
      }
    }
    return null;
  }

function locate_item_array_compound(item1, item2) {
    name1 = item1["item_info"]["name"];
    level1 = item1["item_info"]["level"];
    slotcompound = item1["slot_info"];
    console.log(item1["slot_info"])
  
    for (let i = 0; i < character.items.length; i++) {
      if (item2 === 0) {
        //console.log(slotcompound + " " + i + name1);
            if (
            character.items[i] && 
            character.items[i].name === name1 &&
            character.items[i].level === level1 &&
            slotcompound !== i
            ) {
                //console.log("right item");
            return { item_info: character.items[i], slot_info: i };
            } else {
                //console.log("wrong item");
            continue;
            }
      } else if (
        character.items[i] && 
        character.items[i].name === name1 &&
        character.items[i].level === level1 &&
        item2 !== null &&
        item2.slot_info !== i &&
        slotcompound !== i
      ) {
        return { item_info: character.items[i], slot_info: i };
      }
    }
    return "not found";
  }

async function upgrade_own(item1,place){
    slot_1 = locate_item_array(item1,place)
    game_log("before " + slot_1);
    if(slot_1["item_info"]["level"] <= 4){
        slot_2 = locate_item("scroll0");
        slot_1["item_info"]
        game_log("scroll0");  
    }else if(slot_1["item_info"]["level"] && slot_1["item_info"]["level"] < 7){
        slot_2 = locate_item("scroll1");
        game_log("scroll1");
    }else{
       return game_log("not the correct item")
    }
    await upgrade(slot_1["slot_info"],slot_2).then(async function(data){
        if(data.success){ 
            game_log("I have a +"+data.level+" coat now!"); 
            await upgrade_own(item1,place);
        }else{ return game_log("Rip "+ item1["name"]+ ", you'll be missed.")};
    });
}
async function compound_own(item1,slot) {
    const slot_1 = locate_item_array(item1,slot);

    //console.log("Slot 1:", slot_1);
  
    if (slot_1 && slot_1.item_info["level"] !== 3) {
      //console.log("I am inside the level in compound");
  
      const slot_2 = locate_item_array_compound(slot_1, 0);
      //console.log("Slot 2:", slot_2);
  
      if (slot_2 === "not found") {
        //console.log("Slot 2 was not found");
        return;
      }
  
      const slot_3 = locate_item_array_compound(slot_1, slot_2);
      //console.log("Slot 3:", slot_3);
  
      if (slot_3 === "not found") {
        //console.log("Slot 3 was not found");
        return;
      }
  
      let slot_4;
      if (slot_1.item_info["level"] <= 1) {
        slot_4 = locate_item("cscroll0");
        //console.log("Slot 4: cscroll0");
      } else if (slot_1.item_info["level"] < 3) {
        slot_4 = locate_item("cscroll1");
        //console.log("Slot 4: cscroll1");
      } else {
        //console.log("Not the correct item");
        return;
      }
  
      //console.log("Slot 1:", slot_1["name"],slot_1.item_info["level"], slot_1.slot_info);
      //console.log("Slot 2:", slot_2.item_info["level"], slot_2.slot_info);
      //console.log("Slot 3:", slot_3.item_info["level"], slot_3.slot_info);
      //console.log("Slot 4:", slot_4);
  
      await compound(slot_1.slot_info, slot_2.slot_info, slot_3.slot_info, slot_4).then(
        function (data) {
          console.log("Compound call completed");
          console.log(data);
        },
        function (data) {
          console.log("Compound call failed with reason:", data.reason);
        }
      );
    } else {
      return;
    }
  }
   async function upgrade_go_trough_array() {
    sell_stuff()
    for (let i = 0; i < character.items.length; i++) {
      const slot = character.items[i];
      if (slot != null) {
        if (upgrade_list.includes(slot["name"])) {
          await upgrade_own(slot["name"],i);
        } else if (compound_list.includes(slot["name"])) {
          await compound_own(slot["name"],i);
        }
      }
    }
  }
function addButtons() {
    add_bottom_button("TeleportTown", "🌀", () => {
        parent.socket.emit('town');
    });
    add_bottom_button("move2Main", "🏠", () => {
        smart_move({ to: "main" });
    });
    add_bottom_button("move2Bank", "💰", () => {
        smart_move({ to: "bank" });
    });
    add_bottom_button("phoenixScout", "🦅", () => {
        phoenix_scout();
    });
    add_bottom_button("upgrade", "🐙", () => {
        upgrade_go_trough_array();
    });
    //add_bottom_button("showStatus", "📈", showStatus);
    add_bottom_button("tradeHistory", "📜", () => {
        parent.socket.emit('trade_history');
    });
    add_bottom_button("showPing", "📡", () => {
        safe_log(`📡 Ping... ping... ${Math.floor(character.ping)}ms`);
    });
    add_bottom_button("Pause", "⏸️", pause);
}
async function phoenix_scout(){
  await smart_move({x:-375, y:-1287, map:"cave"})
  if(check_for_monster("phoenix") == 1){
    gather_the_troops()
    return
  }
  await smart_move({x:708, y:-300, map:"main"})
  if(check_for_monster("phoenix")== 1){
    gather_the_troops()
    return
  }
  await smart_move({x:378, y:1686, map:"main"})
  if(check_for_monster("phoenix")== 1){
    gather_the_troops()
    return
  }
  await smart_move({x:-1358, y:-118, map:"main"})
  if(check_for_monster("phoenix") == 1){
    gather_the_troops()
    return
  }
  await smart_move({x:-166, y:453, map:"halloween"})
  if(check_for_monster("phoenix")== 1){
    gather_the_troops()
    return
  }

}
function check_for_monster(monstertype){
  if(get_nearest_monster({type: monstertype}) != null){
    return 1
  }else{
    return null
  }
}
function gather_the_troops(){
  send_cm(leader,"4," + character.x + "," + character.y + "," + character.map)
}

//make sure right things are being bought always have 500 potions of both 100 of every scroll
//upgrade_go_trough_array();
addButtons();
initiate_code();

//game_log(slot_1["item_info"]['level'] + " " +slot_2["item_info"]['level'] + " " +slot_3["item_info"]['level']);

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland