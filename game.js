const TOTAL_PAIRS = Math.max(Math.min(Math.floor(window.location.search.split("?")[1]) || 12, 25), 1);
const TOTAL_POKEMON = 1024;
let board_locked = false;
const flipped_cards = [];
let score = 0;
const cards = [];

const MY_PHOTO = "https://media.licdn.com/dms/image/v2/C5603AQGC1ZHxXSCFJw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1547701341146?e=1740009600&v=beta&t=gJb8n7Vzb7qC9rYYmZB7r43fOhhkY6yVFanB_JC3xsA";

function clearBoard() {
    const container = document.getElementById("card-container");
    container.innerHTML = "";
}

async function setupBoard() {
    const pokemon_ids = new Set();

    // pokemon_ids.add(10000); // Just to trigger the "Not found" case, for fun :P

    while (pokemon_ids.size < TOTAL_PAIRS) {
        pokemon_ids.add(1 + Math.floor(Math.random() * TOTAL_POKEMON));
    }

    const pokemon_data_promises = [];

    pokemon_ids.forEach((pokemon_id) => pokemon_data_promises.push(
        fetch("https://pokeapi.co/api/v2/pokemon/" + pokemon_id)
            .then(response => { return response.json(); })
            .catch(() => {
                return {
                    name: "Not Found",
                    sprites: { front_default: MY_PHOTO }
                };
            }).then(pokemon_object => { return { name: pokemon_object.name, sprite: pokemon_object.sprites.front_default }; })
    ));


    const pokemon_datas = await Promise.all(pokemon_data_promises);
    const card_datas = [...pokemon_datas, ...pokemon_datas].sort(() => Math.random() - 0.5);

    const cards_flipped = [];

    cards.forEach(async (card, card_index) => {
        const card_data = card_datas[card_index];
        card.setAttribute("data-name", card_data.name);

        cards_flipped.push(new Promise((resolve, reject) => {
            card.classList.remove("flipped");
            card.classList.remove("matched");
            card.querySelector(".front_text").innerHTML = "Loading...";
            setTimeout(() => {
                card.querySelector(".pokemon_name").innerHTML = card_data.name;
                card.querySelector(".pokemon_image").setAttribute("src", card_data.sprite);
                card.querySelector(".front_text").innerHTML = "Match the Pokemon!";
                setTimeout(() => resolve(), 500);
            }, 500);
        }));

    });
    Promise.all(cards_flipped).then(() => board_locked = false);
    // board_locked = false;
}

async function initializeBoard() {
    board_locked = true;
    const container = document.getElementById("card-container");

    Array(2 * TOTAL_PAIRS).fill(0).forEach(() => {
        const card = document.createElement("div")
        card.classList.add("card");

        card.innerHTML = `
        <div tabindex="1" class="card-inner">
            <div class="face front">
                <h3 class="front_text">Loading...</h3>
            </div>
            <div class="face back">
                <p class="pokemon_name" ></p>
                <img class="pokemon_image"/>
            </div>
        </div>
        `;
        card.addEventListener("click", () => flipCard(card));

        card.addEventListener("keydown", (key_event) => {
            if (key_event.code == "Enter") {
                flipCard(card);
            }
        });

        cards.push(card);

        container.appendChild(card);
    });
}

function flipCard(card) {
    if (board_locked || card.classList.contains("flipped")) {
        return;
    }

    card.classList.add("flipped");
    flipped_cards.push(card);
    if (flipped_cards.length >= 2) {
        checkIfMatch();
    }
}

function checkIfMatch() {
    board_locked = true;
    const card1 = flipped_cards[0];
    const card2 = flipped_cards[1];

    if (card1.dataset.name == card2.dataset.name) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        flipped_cards.splice(0, flipped_cards.length);
        score += 1;

    }
    setTimeout(() => {
        flipped_cards.forEach(card => card.classList.remove("flipped"))
        flipped_cards.splice(0, flipped_cards.length);
        board_locked = false;
        if (score == TOTAL_PAIRS) {
            board_locked = true;
            alert("YOU WON!");
            setupBoard();
            score = 0;
        }
    }, 750);



}

initializeBoard();
setupBoard();
