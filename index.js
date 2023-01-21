const dotenv = require('dotenv');
const cheerio = require('cheerio');

dotenv.config();

let old_notes = [];

async function main(sendWebooks) {
    const response = await fetch("https://" + process.env.DOMAIN + "/main/document/document.php?id=" + process.env.DOCUMENT_ID, {
        method: "GET",
        headers: {
            cookie: 'ch_sid=' + process.env.COOKIE
        }
    });

    console.log(response.status);
    if(response.status != 200) {
        console.log("Error");
        fetch(process.env.WEBHOOK, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "content": "Chamilo error!",
                "username": "Chamilo"
            })
        });
    }

    const body = await response.text();

    const $ = cheerio.load(body);

    $(".data_table > tbody").children().each((i, row) => {
        if (i == 0) return;
        const fileNode = $($(row).children()[1]);
        const fileName = fileNode.text();
        if(!old_notes.some(v => fileName.includes(v))) {
            console.log("New notes found : " + fileName);
            old_notes.push(fileName);
            if(!sendWebooks) return;
            fetch(process.env.WEBHOOK, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "content": "Nouvelle note sur Chamilo: `" + fileName + "`",
                    "username": "Chamilo"
                })
            });
        }
    });
}

main(false);
setInterval(main, 10000, true);