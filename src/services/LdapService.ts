import ldap from 'ldapjs';

export class LdapService {
    private readonly ldapUrl: string;
    private readonly ldapDnPattern: string;

    constructor() {
        this.ldapUrl = process.env.LDAP_URL || 'ldap://ldap.zut.edu.pl';
        this.ldapDnPattern = process.env.LDAP_DN || 'uid=%s,cn=users,cn=accounts,dc=zut,dc=edu,dc=pl';
    }

    /**
     * Authenticate a user against the LDAP server.
     * @param username The username (uid)
     * @param password The password
     * @returns Promise<boolean> true if authentication succeeds
     */
    async authenticate(username: string, password: string): Promise<{ isAuthenticated: boolean, givenName?: string, surname?: string, title?: string }> {
        return new Promise((resolve, reject) => {
            const client = ldap.createClient({
                url: this.ldapUrl,
                timeout: 5000,
                connectTimeout: 5000
            });

            client.on('error', (err) => {
                console.error('LDAP Client Error:', err);
                resolve({ isAuthenticated: false });
            });

            const userDn = this.ldapDnPattern.replace('%s', username);

            client.bind(userDn, password, (err) => {
                if (err) {
                    console.log('LDAP Bind failed:', err.message);
                    client.unbind();
                    return resolve({ isAuthenticated: false });
                }

                console.log('LDAP Bind successful for:', username);

                // Now search for user details
                const searchOptions: ldap.SearchOptions = {
                    scope: 'base',
                    filter: '(objectClass=*)',
                    attributes: ['givenName', 'sn', 'title', 'cn']
                };

                client.search(userDn, searchOptions, (err, res) => {
                    if (err) {
                        console.error('LDAP Search failed:', err);
                        client.unbind();
                        return resolve({ isAuthenticated: true }); // Auth worked, but details failed
                    }

                    let givenName = '';
                    let surname = '';
                    let title = '';

                    res.on('searchEntry', (entry) => {
                        const obj = entry.pojo; // entry.object is deprecated/removed in some versions? No, usually it's pojo for raw object or object for instance.
                        // Actually in @types/ldapjs:
                        // SearchEntry has 'object' getter?
                        // Let's cast to any to avoid TS error if types are mismatching
                        const userEntry = (entry as any).object || (entry as any).pojo || {};
                        givenName = userEntry.givenName || '';
                        surname = userEntry.sn || '';
                        title = userEntry.title || '';
                    });

                    res.on('error', (err) => {
                        console.error('Search entry error:', err);
                    });

                    res.on('end', (result) => {
                        client.unbind();
                        resolve({
                            isAuthenticated: true,
                            givenName,
                            surname,
                            title
                        });
                    });
                });
            });
        });
    }
}
