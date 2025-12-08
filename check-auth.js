const ldap = require('ldapjs');

const USERNAME = 'bi55857';
const PASSWORD = 'asdsdafsdasd';
// --------------------

const client = ldap.createClient({
    url: 'ldap://ldap.zut.edu.pl',
    timeout: 5000,
    connectTimeout: 5000
});

const dn = `uid=${USERNAME},cn=users,cn=accounts,dc=zut,dc=edu,dc=pl`;

console.log('---------------------------------------------------');
console.log('Próba połączenia z LDAP...');
console.log('URL: ldap://ldap.zut.edu.pl');
console.log(`DN: ${dn}`);
console.log('---------------------------------------------------');

client.on('error', (err) => {
    console.error('BŁĄD KLIENTA (Połączenie nieudane):', err.message);
    process.exit(1);
});

client.bind(dn, PASSWORD, (err) => {
    if (err) {
        console.error('❌ Logowanie NIEUDANE.');
        console.error('Szczegóły błędu:', err.message);
        if (err.message.includes('InvalidCredentials')) {
            console.log('--> Sprawdź poprawność hasła lub loginu.');
        }
    } else {
        console.log('✅ Logowanie UDANE! Poświadczenia są poprawne.');
        console.log('Struktura DN jest prawidłowa, a serwer LDAP odpowiada.');
    }
    client.unbind();
});
