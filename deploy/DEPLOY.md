# Putting nova-habitation-piscine.fr online (IONOS VPS)

Target setup, everything on one IONOS **VPS Linux** running **Ubuntu 24.04**:

| Part | Where on the server |
|---|---|
| Website (Angular build) | `/var/www/nova-habitation-piscine` — served by nginx |
| Backend (NestJS) | `/opt/nova-habitation-backend` — runs as a systemd service on port 3000 |
| Database | PostgreSQL on the same VPS |
| Photos | `/opt/nova-habitation-backend/uploads` — served by nginx |
| HTTPS | Free Let's Encrypt certificate (certbot) |

Commands marked **[PC]** run on your computer, **[VPS]** on the server.
Replace `VPS_IP` with your server's IP address (IONOS panel → Serveurs & Cloud).

---

## 1. Point the domain to the VPS

IONOS panel → Domaines → `nova-habitation-piscine.fr` → DNS. Set:

| Type | Nom d'hôte | Valeur |
|---|---|---|
| A | `@` | `VPS_IP` |
| A | `www` | `VPS_IP` |

Delete any other `A`/`AAAA` records for `@` and `www`. It can take up to a few hours to apply.

## 2. Prepare the server

**[PC]** Connect (the root password is in the IONOS panel):
```bash
ssh root@VPS_IP
```

**[VPS]** Update, install everything, open the firewall:
```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs postgresql nginx certbot python3-certbot-nginx rsync
npm install -g npm@11

ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

# User that runs the site (never run the app as root)
adduser --disabled-password --gecos "" nova
mkdir -p /opt/nova-habitation-backend/uploads /var/www/nova-habitation-piscine
chown -R nova:nova /opt/nova-habitation-backend /var/www/nova-habitation-piscine
# Let your PC's SSH key log in as nova too (if root has one)
mkdir -p /home/nova/.ssh && cp ~/.ssh/authorized_keys /home/nova/.ssh/ 2>/dev/null; chown -R nova:nova /home/nova/.ssh
```
If you log in with a password rather than a key, set one for nova: `passwd nova`.

## 3. Create the database

**[VPS]** Choose a strong password and keep it for step 4:
```bash
sudo -u postgres psql -c "CREATE USER nova WITH PASSWORD 'STRONG_DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE nova_habitation OWNER nova;"
```

## 4. Install the backend

**[PC]** Send the backend code (without dependencies, build, photos or local `.env`):
```bash
rsync -av --exclude node_modules --exclude dist --exclude uploads --exclude .env \
  ~/nova-habitation-backend/ nova@VPS_IP:/opt/nova-habitation-backend/
```

**[VPS]** As the `nova` user, create the production `.env`:
```bash
su - nova
cd /opt/nova-habitation-backend
cp .env.example .env
openssl rand -hex 32     # copy the output: it's your JWT_SECRET
nano .env
```
Set at least:
```
DB_USERNAME=nova
DB_PASSWORD=STRONG_DB_PASSWORD
DB_NAME=nova_habitation
JWT_SECRET=<output of openssl rand -hex 32>
CORS_ORIGINS=https://nova-habitation-piscine.fr,https://www.nova-habitation-piscine.fr
NODE_ENV=production
```
(Optional) email notifications for the contact form — with an IONOS mailbox:
```
SMTP_HOST=smtp.ionos.fr
SMTP_PORT=587
SMTP_USER=contact@nova-habitation-piscine.fr
SMTP_PASSWORD=<mailbox password>
SMTP_FROM=contact@nova-habitation-piscine.fr
```
Without SMTP, messages are still saved and visible in the admin **Messages** page.

Then install, build and create your admin account:
```bash
npm ci
npm run build
npm run create-admin -- --username admin --email contact@nova-habitation-piscine.fr
exit
```
The tables are created automatically at the first start (step 5).

### Optional: bring the content you already entered on your PC

Do this **after step 5** (the service must have started once).

**[PC]**
```bash
pg_dump -h localhost -U postgres -Fc --data-only --exclude-table=migrations --exclude-table=admins \
  nova_habitation > nova-content.dump
scp nova-content.dump nova@VPS_IP:/tmp/
rsync -av ~/nova-habitation-backend/uploads/ nova@VPS_IP:/opt/nova-habitation-backend/uploads/
```
**[VPS]**
```bash
sudo -u postgres psql nova_habitation -c "TRUNCATE about_info, contact_info, services, slides, realisations, chantiers, photos, contact_messages RESTART IDENTITY CASCADE;"
sudo -u postgres pg_restore --data-only --disable-triggers -d nova_habitation /tmp/nova-content.dump && rm /tmp/nova-content.dump
sudo -u postgres psql nova_habitation -c "DO \$\$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['services','slides','realisations','chantiers','photos','contact_messages'] LOOP EXECUTE format('SELECT setval(pg_get_serial_sequence(%L,''id''), COALESCE(MAX(id),1)) FROM %I', t, t); END LOOP; END \$\$;"
systemctl restart nova-backend
```

## 5. Start the backend as a service

**[PC]** `scp ~/nova-habitation-piscine/deploy/nova-backend.service root@VPS_IP:/etc/systemd/system/`

**[VPS]** (as root)
```bash
systemctl daemon-reload
systemctl enable --now nova-backend
systemctl status nova-backend      # should say "active (running)"
journalctl -u nova-backend -n 50   # logs, if something is wrong
```

## 6. Website + HTTPS

**[PC]** Build and send the site:
```bash
cd ~/nova-habitation-piscine
npm run build
rsync -av --delete dist/nova-habitation-piscine/browser/ nova@VPS_IP:/var/www/nova-habitation-piscine/
scp deploy/nginx.conf root@VPS_IP:/etc/nginx/sites-available/nova-habitation-piscine
```

**[VPS]** (as root)
```bash
ln -s /etc/nginx/sites-available/nova-habitation-piscine /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# HTTPS certificate (the DNS from step 1 must already point to the VPS)
certbot --nginx -d nova-habitation-piscine.fr -d www.nova-habitation-piscine.fr --redirect
```
Certbot renews the certificate automatically.

Open https://nova-habitation-piscine.fr and https://nova-habitation-piscine.fr/admin/login 🎉

## 7. Check list after going online

- [ ] Log in to the admin and fill **Nos coordonnées** with the real phone, email, address, **SIREN/SIRET** and social links (the defaults are placeholders).
- [ ] Send yourself a message from the Contact page and check it appears in **Messages** (and by email if SMTP is set).
- [ ] Upload a photo from the admin and check it shows on the site.
- [ ] Submit the site to Google: https://search.google.com/search-console (add the domain, then the sitemap `https://nova-habitation-piscine.fr/sitemap.xml`).

## 8. Nightly backups

**[PC]** `scp ~/nova-habitation-piscine/deploy/backup.sh nova@VPS_IP:/home/nova/`

**[VPS]**
```bash
su - nova
chmod +x ~/backup.sh && ~/backup.sh && ls ~/backups     # test it once
(crontab -l 2>/dev/null; echo "30 3 * * * /home/nova/backup.sh") | crontab -
```
Backups (database + photos, last 14 days) are in `/home/nova/backups`. A copy outside the VPS is
safer: from time to time, **[PC]** `rsync -av nova@VPS_IP:/home/nova/backups/ ~/nova-backups/`.

Restore the database from a backup: `pg_restore --clean -d nova_habitation db_XXXX.dump`.

---

## Updating the site later

**Website change** — **[PC]**
```bash
cd ~/nova-habitation-piscine && npm run build
rsync -av --delete dist/nova-habitation-piscine/browser/ nova@VPS_IP:/var/www/nova-habitation-piscine/
```

**Backend change** — **[PC]**
```bash
rsync -av --exclude node_modules --exclude dist --exclude uploads --exclude .env \
  ~/nova-habitation-backend/ nova@VPS_IP:/opt/nova-habitation-backend/
ssh nova@VPS_IP "cd /opt/nova-habitation-backend && npm ci && npm run build"
ssh root@VPS_IP "systemctl restart nova-backend"
```
If you changed an entity, generate the migration on your PC first
(`npm run migration:generate -- src/migrations/Name`): the server applies it when it restarts.

**Change the admin password** — **[VPS]**
`su - nova -c "cd /opt/nova-habitation-backend && npm run create-admin -- --username admin"`
