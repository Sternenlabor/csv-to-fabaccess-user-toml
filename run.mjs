import csv from 'csv-parser'
import fs from 'fs'
import iconv from 'iconv-lite'
import toml from '@iarna/toml'

const DEFAULT_PASSWORD = 'secret'

const users = {
    Admin1: {
        roles: ['Admin'],
        passwd: 'secret'
    }
}

async function readCSV(filePath) {
    const results = []

    const stream = fs
        .createReadStream(filePath)
        .pipe(iconv.decodeStream('iso-8859-1'))
        .pipe(
            csv({
                separator: ';'
            })
        )

    for await (const record of stream) {
        results.push(record)
    }

    return results
}

function getGroups(u) {
    let groups = u.Gruppen.split(', ')
    groups = groups.filter((item) => item !== 'Mitglieder-Infos' && item !== '')
    return ['User', ...groups]
}

readCSV('./Mitgliederliste.csv')
    .then((results) => {
        console.log(results)
        let userCounter = 0

        for (const u of results) {
            if (u.Login == '') {
                continue
            }

            users[u.Login] = {
                roles: getGroups(u),
                passwd: DEFAULT_PASSWORD
            }

            userCounter++
        }

        const tomlContent = toml.stringify(users)

        fs.promises
            .writeFile('user.toml', tomlContent)
            .then(() => console.log('File created successfully'))
            .catch((err) => console.error('Failed to create file', err))

        console.log('users:', userCounter)
    })
    .catch((err) => console.error(err))
