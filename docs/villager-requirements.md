# Requirements per dorpeling — stand van zaken

> Gebaseerd op de chats op het HTF-platform (stand: 24/11/2026).
> **Bevestigd** = letterlijk door de dorpeling gezegd. **Voorstel** = onze interpretatie, nog niet bevestigd.
> Werk dit bestand bij na elk nieuw antwoord.

---

## 💧 Maren Holt — water keeper

**Probleem:** "I'm always too late. Help me know where to go first."
**Context:** zes leidingen, één ploeg (Maren + 2 helpers), ze halen **± 2 herstellingen per dag**.

### Bevestigd
- **Wat ze elke ochtend wil weten:** *waar eerst, waar daarna, en waarom die eerst*. Daarna vertrekt ze met haar helpers.
- **Status per leiding** (`flow% = currentFlowRate / nominalFlowRate × 100`):

  | Status | Regel | Betekenis |
  | --- | --- | --- |
  | **Alarm** | flow < 50% **of** druk < 25 PSI | "drop everything" |
  | **Visit** | flow < 80% **of** druk < 40 PSI | bezoek plannen deze week |
  | **OK** | flow ≥ 80% **en** druk ≥ 40 PSI | in orde — exact 80% / 40 PSI is OK |

- **Volgorde bij meerdere alarmen:**
  1. Liggen ze **op dezelfde lijn** → eerst de leiding **stroomopwaarts** (die treft iedereen erna).
  2. Liggen ze **op verschillende lijnen** → mensen eerst:
     **North Residential Area** (± 140 gezinnen) → **The Bakery** → **South Meadow Farms** (dieren redden het een halve dag met de troggen).

### Huidige data met haar regels
| Leiding | Flow | Druk | Status | Voedt |
| --- | --- | --- | --- | --- |
| NORTH-BRANCH-02 | 30,8% | 22 PSI | 🔴 Alarm | North Residential Area |
| SECONDARY-LOOP | 30,0% | 20 PSI | 🔴 Alarm | niets rechtstreeks (North Mill House → Silverbrook Spring) |
| SOUTH-BRANCH | 66,7% | 38 PSI | 🟠 Visit | South Meadow Farms |
| PRIMARY-MAIN, NORTH-BRANCH-01, BAKERY-BRANCH | ≥ 94% | ≥ 47 PSI | 🟢 OK | — |

"Stroomopwaarts" kunnen we afleiden uit de data: leiding A ligt vóór B als `A.endPoint = B.startPoint`
(bv. PRIMARY-MAIN → NORTH-BRANCH-01 → NORTH-BRANCH-02).

### Voorstel (wat we bouwen)
- Berekende velden `flowPercent` en `pipeStatus` (Alarm / Visit / OK) — `👋 EXAMPLE`-patroon.
- Een **geordende werklijst** "waar eerst heen" met per regel het **waarom** in gewone taal
  (bv. "Alarm: flow 31% van normaal — voedt North Residential Area, 140 gezinnen").
- Eventueel op de dorpskaart (leidingen via `mapPath`, kleur + icoon per status).

### Nog open
1. **Leidingen die geen plek voeden** (SECONDARY-LOOP, de hoofdleidingen): waar vallen die in de volgorde?
   SECONDARY-LOOP is nu in alarm.
2. **Gaat elk Alarm vóór elke Visit?** (logisch, maar niet letterlijk gezegd.)
3. **Welke volgorde bij Visits onderling** — dezelfde regels als bij alarmen?
4. **Sensor of leiding?** SENS-004 meet 140 L/min op BAKERY-BRANCH (leiding zegt 47, capaciteit 50). Welke waarde vertrouwt ze?
5. Wil ze een **dagplanning** (2 herstellingen per dag) of gewoon de volgorde?
6. Nog niet gesteld: *hoe ontdekte ze de laatste keer dat er iets mis was?* (minder nodig nu de regels bekend zijn).

---

## 🍞 Tobin Reyes — baker

**Probleem:** "I want to know before it goes wrong, not after."

### Bevestigd
- **Status per product** (velden van `StockItems`):

  | Status | Regel | Betekenis |
  | --- | --- | --- |
  | **Critical** | `currentQuantity` < `minStockLevel` / 2 | "panic" |
  | **Low** | `currentQuantity` < `minStockLevel` | "nervous" |
  | **OK** | `currentQuantity` ≥ `minStockLevel` | comfort level |

- **Vooruit waarschuwen:** hij wil het weten **minstens zoveel dagen op voorhand als de levering van dat product duurt**,
  zodat hij kan bestellen vóór het onder zijn comfort level zakt.
  - `dagen tot onder minimum = (currentQuantity − minStockLevel) / consumptionRate`
  - **waarschuwen als** dagen tot onder minimum ≤ levertijd
- **Bekende levertijden:**

  | Product | Leverancier | Levertijd |
  | --- | --- | --- |
  | Milk | Local Dairy Farm | 1 dag |
  | Flour | North Mill | 3 dagen |
  | Grain | North Mill | 3 dagen |

### Huidige data met zijn regels (alleen bekende levertijden)
- **Milk:** (180 − 120) / 60 = 1 dag ≤ 1 → **nu bestellen**
- **Flour:** 40 < 45 → al **Low**
- **Grain:** (45 − 30) / 4 = 3,75 dagen > 3 → nog OK
- Zonder levertijd, maar al onder het minimum: **Eggs** 5 < 12/2 → **Critical**; **Butter** −3 → Critical (en onmogelijk, zie Ilse).

### Voorstel (wat we bouwen)
- Datamodel uitbreiden: entiteit **`Suppliers`** (naam, levertijd in dagen) + koppeling `StockItems.supplier`
  — North Mill levert twee producten, zo staat zijn levertijd op één plek.
- Berekende velden `stockStatus` (OK / Low / Critical), `daysUntilLow` en `orderNow` (ja/nee).
- Een lijst "bestel nu" met per regel het waarom.

### Nog open
1. **Leverancier + levertijd van:** Apples, Butter, Eggs, Potatoes, Bread, Cheese, Salt.
   (Bread: bakt hij dat zelf?)
2. **Hoe wil hij gewaarschuwd worden?** Lijst die hij bekijkt, of een melding die hij moet bevestigen
   (de tabel `Notifications` met `acknowledged` bestaat al, is leeg).

---

## 🏛️ Rowan Ashby — chair of the village council

**Probleem:** "We want to see at a glance how Oakhaven is doing."

### Bevestigd
- Elke **maandag** beslist de raad waar het geld heen gaat — nu op gevoel ("wie het hardst klaagt").
- **Budget: 500 crowns per week**, te verdelen over:
  - een kapotte leiding herstellen: **± 120 crowns**
  - een spoedlevering voedsel: **± 80 crowns extra** bovenop de normale prijs
- Ze missen **het grote plaatje: welk deel van het dorp er echt slechter aan toe is**.
- **Zijn twee criteria:**
  1. **Heeft iedereen water?**
  2. **Lijdt niemand honger deze week?**
- Wanneer een leiding kapot is of voedsel dringend → **dat bepalen Maren en Tobin** (zie hierboven).

### Voorstel (wat we bouwen)
- Eén overzicht op basis van de regels van Maren en Tobin:
  - **Water:** per plek (`Landmarks.suppliedBy`) — heeft die plek water? Nu: North Residential Area **nee** (Alarm), South Meadow Farms verminderd (Visit).
  - **Voedsel:** welke producten raken op binnen 7 dagen / staan Low of Critical.
  - **Budget:** wat kost het om alles te verhelpen vs. 500 crowns.
- Eventueel op de dorpskaart per `gridCell` ("welk deel van het dorp").

### Nog open
1. **Water of voedsel eerst** als 500 crowns niet volstaat?
2. **Wat kost geld?** Alleen Alarm-leidingen (120), of ook Visit? Spoedlevering bij Low of pas bij Critical?
3. **Voorstel of overzicht?** Moet de app een verdeling van het budget voorstellen, of alleen tonen?
4. "Deze week" = de komende 7 dagen? (aangenomen, niet bevestigd)

---

## 🔍 Ilse Vermeer — librarian

**Probleem:** "Somebody tampered with our data. I want to see what changed."

### Bevestigd
- Ze wil **bewijs, geen geruchten**.
- Een **eerlijke fout** gebeurt overdag, onder iemands eigen naam → geen geknoei.
- **Bewijs = meerdere signalen wijzen dezelfde kant op:**
  1. 🔢 een **waarde die niet waar kan zijn**
  2. 🌙 aangepast **midden in de nacht**
  3. 🤖 door **een naam die geen persoon is**
- **Per regel** wil ze in gewone taal lezen: **wat er mis is, wanneer het veranderd is en door wie** —
  zodat ze het aan de raad kan uitleggen "zonder magie" (geen ondoorzichtige scores).

### Huidige data met haar regels
Drie rijen, alle drie door `system` op **17/11/2026 03:13**, alle drie met een onmogelijke waarde:

| Rij | Wat is er mis | Wanneer | Door wie |
| --- | --- | --- | --- |
| StockItems BUTTER | voorraad **−3 kg** — negatieve voorraad kan niet | 17/11 03:13 | `system` |
| Sensors SENS-004 | **140 L/min** op een leiding met capaciteit 50 (leiding zelf: 47) | 17/11 03:13 | `system` |
| Repairs "Replaced valve seal at the meadow junction" | herstellingsdatum **30/12/2026 ligt in de toekomst**, op naam van "Tobin Reyes" | 17/11 03:13 | `system` |

Niet verdacht volgens haar definitie: Maren die voedselvoorraad aanpast, Tobin die leidingen aanpast
(overdag, eigen naam).

Apart opgemerkt (valt buiten haar drie signalen): een herstelling door "W. S." met omschrijving
*"Sealed the old door beneath the spring"* en een base64-"Key". Lijkt een verstopt raadsel —
eventueel aan een coach vragen.

### Voorstel (wat we bouwen)
- Een lijst **verdachte wijzigingen**: per rij de signalen die van toepassing zijn, met een zin per signaal
  (wat / wanneer / door wie), gesorteerd op aantal signalen.
- Regels voor "onmogelijke waarde" (te bevestigen): negatieve voorraad, sensor boven capaciteit van de leiding,
  herstellingsdatum in de toekomst.
- Let op: de data bewaart alleen de **laatste** wijziging (`modifiedAt`/`modifiedBy`), geen oude waarden.

### Nog open
1. **Welke namen zijn personen?** Is `council` een persoon voor haar?
2. **Wat is "midden in de nacht"?** Tussen welke uren?
3. **Hoeveel signalen zijn genoeg?** Alle drie, of twee? Regels met één signaal ook tonen (bv. als "check")?
4. **Welke waarden zijn onmogelijk?** Onze drie bevestigen of aanvullen.
5. Wil ze ook een **geschiedenis** van toekomstige wijzigingen (oude → nieuwe waarde)? Dat moeten we dan zelf gaan bijhouden.

---

## Over de dorpelingen heen

- **Rowan bouwt op Maren en Tobin:** hun statusregels zijn de bouwstenen van zijn overzicht.
- **Rode draad: "waarom" tonen.** Maren wil weten *waarom* een leiding eerst komt, Ilse wil per regel lezen *wat* er mis is.
  Elke lijst krijgt dus een leesbare uitleg, niet alleen een kleur.
- **Datamodel-gaten:** leveranciers + levertijden (Tobin). Verder volstaat het bestaande model.
- **Klaar om te bouwen (regels liggen vast):** `pipeStatus` (Maren), `stockStatus` (Tobin).
