$(document).ready(function () {
    /* Moralis init code */
    const serverUrl = "https://4zz4tvgotmsi.usemoralis.com:2053/server";
    const appId = "iMC3wZcEO2oYCo8migyFq3OelvnP5MXr2NfmR1v0";
    Moralis.start({ serverUrl, appId });

    $container_login = $("#container_login");
    $container_battles = $("#container_battles");

    var logged_in = false;
    checkUser();

    function checkUser() {
        let user = Moralis.User.current();
        if (user) {
            logged_in = true;
            $("#account_id").find("span:eq(0)").text("Account ID: " + user.id + ", Wallet Address: " + user.get("ethAddress"));
            $container_battles.show();
            $container_login.hide();
            load_battles();
        }
    }
    /* Authentication code */
    async function login() {
        let user = Moralis.User.current();
        if (!user) {
            user = await Moralis.authenticate({
                signingMessage: "Log in using Moralis",
            })
                .then(function (user) {
                    logged_in = true;
                    console.log("logged in user:", user);
                    $("#account_id").text("Account ID: " + user.id + ", Wallet Address: " + user.get("ethAddress"));
                    $container_battles.show();
                    $container_login.hide();
                    load_battles();
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }

    async function logOut() {
        await Moralis.User.logOut();
        $("#account_id").text("please login to display account details.");
        $container_battles.hide();
        $container_login.show();
        logged_in = false;
    }

    async function load_battles() {
        const Battle = Moralis.Object.extend("Battle");
        const query = new Moralis.Query(Battle);
        const results = await query.find();
        var tr = $($.parseHTML("<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>"));
        $("#table_battles_body").empty();
        for (let i = 0; i < results.length; i++) {
            const object = results[i];
            console.log(object.id);
            tr.find("td:eq(0)").text(object.id);
            tr.find("td:eq(1)").text(object.get("name"));
            tr.find("td:eq(2)").text(object.get("players"));
            tr.find("td:eq(3)").text(object.get("max_players"));
            tr.find("td:eq(4)").text(object.get("preparing_time"));
            tr.find("td:eq(5)").text(object.get("status"));

            $("#table_battles_body").append(tr.clone())
        }
    }

    $("#btn_add_battle").on('click', function () {
        $(this).hide();
        $("#form_add_battle").show();
    })

    $("#form_add_battle").on('submit', async function (event) {
        event.preventDefault();

        const input_name = $("#form_add_battle :input[name=input_name]").val();
        const input_max_players = $("#form_add_battle :input[name=input_max_players]").val();
        const input_preparing_duration = $("#form_add_battle :input[name=input_preparing_duration]").val();

        // save battle to moralis.
        const Battle = Moralis.Object.extend("Battle");
        const battle = new Battle();

        battle.set("name", input_name);
        battle.set("max_players", parseInt(input_max_players));
        battle.set("preparing_time", parseInt(input_preparing_duration));
        battle.set("players", "[]");
        battle.set("status", "waiting");

        battle.save().then(
            (battle) => {
                var tr = $($.parseHTML("<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>"));
                tr.find("td:eq(0)").text(battle.id);
                tr.find("td:eq(1)").text(battle.get("name"));
                tr.find("td:eq(2)").text(battle.get("players"));
                tr.find("td:eq(3)").text(battle.get("max_players"));
                tr.find("td:eq(4)").text(battle.get("preparing_time"));
                tr.find("td:eq(5)").text(battle.get("status"));
    
                $("#table_battles_body").append(tr.clone());

                $("#btn_add_battle").show();
                $("#form_add_battle").hide();

            },
            (error) => {
                console.log(error);
                alert('Unknown error.');
            }
        );
    })


    document.getElementById("btn-login").onclick = login;
    document.getElementById("btn-logout").onclick = logOut;
});