const ldap = require('ldapjs');

const USER = 'bi55857'; // Uzytkownik do znalezienia

console.log('--- ROZPOCZYNAM POSZUKIWANIE DN W LDAP ---');

const client = ldap.createClient({
    url: 'ldap://ldap.zut.edu.pl',
    timeout: 5000,
    connectTimeout: 5000
});

client.on('error', (err) => {
    console.log('[!] Błąd połączenia klienta:', err.message);
});

// 1. Proba ANONYMOUS BIND (pusty login/haslo)
client.bind('', '', (err) => {
    if (err) {
        console.log('[-] Anonymous bind failed:', err.message);
        console.log('    Serwer nie pozwala na anonimowe wyszukiwanie. Musimy zgadywać DN.');
        client.unbind();
        return;
    }

    console.log('[+] Anonymous bind SUKCES! Przeszukuję katalog...');

    const searchBase = 'dc=zut,dc=edu,dc=pl';
    const opts = {
        scope: 'sub',
        filter: `(uid=${USER})`,
        attributes: ['dn']
    };

    client.search(searchBase, opts, (err, res) => {
        if (err) {
            console.log('[-] Błąd wyszukiwania:', err.message);
            client.unbind();
            return;
        }

        let found = false;

        res.on('searchEntry', (entry) => {
            console.log('✅ ZNALEZIONO UŻYTKOWNIKA!');
            console.log('👉 DN:', entry.objectName.toString());
            found = true;
        });

        res.on('error', (err) => {
            console.error('[-] Błąd podczas pobierania wyników:', err.message);
        });

        res.on('end', (result) => {
            if (!found) {
                console.log('[-] Nie znaleziono użytkownika w', searchBase);
            }
            client.unbind();
        });
    });
});
