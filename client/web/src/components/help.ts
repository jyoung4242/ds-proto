import { arrow } from "../assets/assetPool";

export class Help {
  componentName: string = "myHelp";

  template: string = `
      <div class="settings_container" \${===myHelp.isVisible}> 
        <div class="setting_relative_container">
            <div class="settings_background_mask">
            </div>
            <div class="help_inner_container">
                <span class="help_title">How To Play</span>
                <span class="help_pagenum">Page \${myHelp.pageNum} / \${myHelp.numPages}</span>
                <div class="help_text" \${===myHelp.page1}>
                  <p>  
                  How to play</p>
                  
                  <p>
                  Introduction
                  </p>

                  <p>
                  Demon Siege is a cooperative, multiplayer deck building game. Game hosts upto 4 players concurrently.  The full game will have 8 levels of increasing difficulty to complete.  
                  As the game progresses, the characters will gain additional skills and bonuses.</p>
                  <p>
                  Objective
                  </p>
                  <p>
                  The objective of each round is to defeat all the monsters on that level before the monsters capture all the available locations for that level.
                  
                  </p>
                </div>
                <div class="help_text" \${===myHelp.page2}>
                  <p>Play Format</p>

                  <p>
                  Each player takes turn for each round.  For each players turn, first a Tower Defense card is played, and the corresponding effects, either passive or active, are applied for each Tower Defense card.
                  </p>
                  
                  <p>After the Tower Defense cards are played, then each active Monster card is then played, with their effects being applied.  After the Tower Defense cards are played and all the Monster cards are played, then the active players hand becomes active.
                  </p>

                  <p>
                  The player can play any of their cards in any order, and the player's turn is completed after all their cards are played.  Each player's card will have an effect to apply, which can include gaining coins, attack points, healing, and so forth.
                  </p>


                  At any time during the players turn, they can choose to spend coins gathered within that turn, and buy additional ability cards from the card pool.  These new purchased cards will be added to the players discard pile, and will be available on the next shuffle.
                  
                  As attack points are collected, the player may choose to apply them to the active monsters of their choosing.  When the cumulative damage for the monster reaches their health level, the monster is defeated, and discarded.
                  
                  The round ends when all the monsters for the level are defeated.
                  </p>
                  
                </div>

                <div class="help_text" \${===myHelp.page3}>
                  <p>
                  Getting Started
                  </p>

                  <p>
                  This is a mulitplayer game, so when player reaches landing site, they must click the 'Login' button to login to the server.  In the lobby, the user will be able to select between logging out, creating a new game, or joining an existing game.
                  </p>
                  <p>Logging out will send player back to the title screen.</p>
                  
                  <p>Create New Game will send player to character creation screen.</p>
                  
                  <p>Join Game will open a popup to acquire the game ID for the existing game to join, then onto the character creation screen.</p>
                  
                  </p>
                </div>

                <div class="help_text" \${===myHelp.page4}>
                <p>  Character Creation</p>

                <p>
                There are 4 classes of characters, and 2 genders that can be selected.</p> <p> There are no applicable difference between genders, just modified sprites.  Each class has some specializations though.  
                The starting deck for each character is determined by their class.  As levels increase, each class receives tailored perks and bonuses based on class.
                
                Barbarian: Attack oriented
                Wizard: Ability point oriented
                Paladin: Team support oriented
                Rogue: Balanced
                
                You must enter a character name to display to proceed past this screen.
                </p>
                <p>
                Staging Screen</p>
                
                This is where all the joined players are staged and waiting until match is started.
                  </p>
                </div>
                <img \${click@=>myHelp.back} class="help_nav_left" src="${arrow}" alt="" />
                <img \${click@=>myHelp.next} class="help_nav_right" src="${arrow}" alt="" />
                <button class="lobbyButton settings_ok" \${click@=>myHelp.closeModal}>OK</button>
            </div>
        </div>
      </div>
        `;

  localState: any;
  constructor(state) {
    this.localState = state;
  }
}
