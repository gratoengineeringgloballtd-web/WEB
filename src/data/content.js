// All site copy and structured content, English and French.
// Text wrapped in [[double brackets]] is a placeholder that still needs confirmed information.

export const STRINGS = {
en: {
  proto:'Prototype. Text with a dashed outline is a placeholder waiting for confirmed information.',
  protoToggle:'Highlight placeholders',
  navAbout:'About', navServices:'Services', navProjects:'Projects', navPartners:'Partners', navNews:'News', navCareers:'Careers', navContact:'Contact',
  megaEyebrow:'How we deliver', megaTitle:'From survey to maintenance', megaText:'Every service follows one five-stage rollout, with a clear deliverable at each stage.', megaLink:'All services',
  ctaQuote:'Request a quote', ctaServices:'Explore services', ctaCall:'Call or visit us', abCall:'Call', abQuote:'Get a quote',
  altHero:'Solar array beside a lattice telecom tower at site Kalakfra', tagSolar:'SOLAR HYBRID',
  heroEyebrow:'Telecom · Power · Connectivity — Cameroon & Nigeria',
  heroTitle:'Building infrastructure. <em>Powering</em> connectivity.',
  heroLead:'Since 2002, Grato Engineering has built, powered and maintained telecom sites for operators and tower companies across Cameroon, Nigeria and Francophone Africa.',
  stYears:'Years in operation', stBuilt:'Towers built', stMaint:'Towers maintained', stCountries:'Countries with offices',
  licLabel:'Licensed by the NCC', licIsp:'ISP · INT/017/22', licColo:'Collocation', licShare:'Infrastructure sharing',
  svcEyebrow:'What we do', svcTitle:'Six service lines, one accountable partner', gnRangeEyebrow:'Range', gnRangeTitle:'Generators for every load', gnRangeNote:'Typical ranges shown; [[confirm the sizes Grato stocks]].', gnBrandTitle:'Brands we sell', gnSectorTitle:'Who we supply', gnAfterEyebrow:'After the sale', gnAfterTitle:'We install it, service it and keep parts in stock', gnSizeEyebrow:'Sizing tool', gnSizeTitle:'Estimate the generator size you need', gnSizeLead:'Enter the total power of the equipment you want to run. We size at a 0.8 power factor with 25% headroom, then round up to a standard rating.', gnLoad:'Total load to run', gnMode:'Do you want to buy or rent?', gnBuy:'Buy', gnRent:'Rent', gnResult:'Recommended size', gnBand:'Suits', gnCalc:n=>`${n} kW ÷ 0.8 × 1.25`, gnHint:'Not sure of your load? Send us your equipment list or an electricity bill and we will size it for you.', gnQuote:'Request a quote for this size', gnRentQuote:'Request a rental quote', gnLargeNote:'Above 2,000 kVA we design a multi-generator system.', gcLabel:'Generator photos', gcPrev:'Previous photo', gcNext:'Next photo', gcPause:'Pause slideshow', gcPlay:'Play slideshow', gcPhoto:'Photo to supply', gcGo:'Show photo', gcCredit:'Photo', gcOwn:'Photo: Grato site', gcStock:'Example photos from Wikimedia Commons; [[replace with photos of Grato stock]].', more:'See details',
  roEyebrow:'How a rollout works', roTitle:'Five stages, one team, a deliverable at every step', roLead:'Select a stage to see what we do and what you receive.', roYou:'You receive', roStage:'Stage',
  bandEyebrow:'Bonaberi warehouse', bandTitle:'One team from the warehouse to the top of the tower.', bandF1:'Equipment held in Bonaberi', bandF2:'Engineers in Douala and Abuja', bandF3:'One contract for the whole rollout',
  mapEyebrow:'Footprint', mapTitle:'Where we work', mapLead:'Head office in Douala, regional office in Abuja, and field teams across both countries. Select a pin or a card.',
  mapCm:'CAMEROON', mapSea:'Gulf of Guinea', mapLugbe:'Lugbe · site works 2025', lgOffice:'Office', lgProject:'Project site (more to add)',
  projEyebrow:'From the field', projTitle:'Recent work on site', projAll:'All projects', readCase:'Read the case study', quickView:'Quick view',
  tmQuote:'A short quote from an operator or tower-company contact about a Grato project, awaiting approval.', tmWho:'Name, title, company', nhEyebrow:'News', nhTitle:'Latest from Grato', nhAll:'All news', slideOf:'Slide', pause:'Pause slideshow', play:'Play slideshow', roAuto:'Auto-playing',
  whyEyebrow:'Why Grato', whyTitle:'Why operators work with us',
  ptEyebrow:'Ecosystem', ptTitle:'Partners and clients', ptAll:'All partners', ptRowPartners:'Technology and supply partners', ptRowClients:'Clients', toConfirm:'to confirm',
  ctaBandTitle:'Planning a rollout or need site support?', ctaBandText:'Tell us about the job and our team will get back to you.',
  abEyebrow:'About Grato', abTitle:'An engineering company built on field work since 2002',
  abP1:'Grato Engineering began on 1 July 2002 as Grato Engineering Ventures, solving everyday infrastructure problems for telecom operators. It was incorporated as Grato Engineering Global Limited in 2010.',
  abP2:'Today the company builds and maintains towers, supplies and installs power systems, delivers connectivity, runs managed technical services and moves equipment across borders.',
  abP3:'It works from a head office in Douala, Cameroon, a regional office in Abuja, Nigeria, and a warehouse in Bonaberi that keeps equipment close to the sites it serves.',
  altWarehouse:'Equipment shelters, cabinets and a forklift in the Grato warehouse yard', capWarehouse:'Shelters, cabinets and gensets staged for dispatch · Grato warehouse yard',
  tlEyebrow:'Milestones', tlTitle:'From a local venture to a regional partner', tlLead:'Years shown with a dashed outline need confirming.',
  vision:'Vision', mission:'Mission',
  visionText:'To bridge digital divides, empowering people and communities for sustainable development across Cameroon, Nigeria and Africa.',
  missionText:'To positively impact lives and transform communities through technology-enabled programmes and interventions.',
  valEyebrow:'Values', valTitle:'How we work', ldEyebrow:'Leadership', ldTitle:'The people accountable for delivery',
  qsEyebrow:'Quality, safety, compliance', qsTitle:'Credentials you can check', qsLead:'Licence and registration numbers are listed so procurement teams can verify them.',
  lcTitle:'Licences and registrations', lcH1:'Licence', lcH2:'Issued by', lcH3:'Reference', lcScope:'Scope',
  profileBtn:'Download company profile (PDF) — available at launch',
  svEyebrow:'Services', svTitle:'Infrastructure, power, generators, connectivity and the people to run it', svLead:'Six service lines that share one rollout process, so one partner can take a site from survey to maintenance.',
  deliv:'What we deliver', how:'How we work', related:'Partners on this service', relProj:'Related projects', quoteThis:'Request a quote for this service', prev:'Previous service', next2:'Next service', svcCount:'Service',
  photoReal:'Photo: Grato site', photoProfile:'Profile visual, replace with a real site photo',
  pjEyebrow:'Projects', pjTitle:'Work in the field', pjLead:'Real photos from Grato sites. Filter by service, open a project for a quick view, or read the full case study.',
  fService:'Service', fCountry2:'Country', all:'All', cCm:'Cameroon', cNg:'Nigeria', cTbc:'To confirm', cOther:'Other',
  noRes:'No projects match these filters yet.', count:n=>`${n} project${n===1?'':'s'} shown`,
  lbWhere:'Location', lbYear:'Year', lbCountry:'Country', lbClient:'Client', lbScope:'Scope', lbService:'Service', ifApproved:'If approved', photoSupply:'Photo to supply',
  csChallenge:'Challenge', csSolution:'Solution', csResult:'Result', csFacts:'Project facts', csSimilar:'Planning something similar?', csMore:'More projects', csBack:'All projects',
  csChallengePh:'What did the client need, and what made it hard? e.g. unreliable grid power, a tight rollout deadline, a difficult site.',
  csResultPh:'The measured outcome, e.g. generator run-hours down 40%, handed over two weeks early, zero safety incidents.',
  paEyebrow:'Partners', paTitle:'Built with established OEMs and operators', paLead:'Partnerships give Grato direct access to equipment and spares, and give clients one local point of contact.',
  paFinance:'Financial partner', paFinanceKind:'Banking', paFinanceText:'Supports Grato’s operations and project financing in Cameroon.', paLogoNote:'[[Confirm each company approves the display of its logo before launch.]]',
  nwEyebrow:'News', nwTitle:'Updates from Grato', nwLead:'Partnerships, licences and work on site. Dates marked with a dashed outline need confirming.',
  crEyebrow:'Careers', crTitle:'Build the networks your neighbours use', crLead:'Grato hires engineers, technicians and site supervisors in Cameroon and Nigeria.',
  crOpenEyebrow:'Open roles', crOpenTitle:'Current openings', crExampleNote:'Example roles, replace with real openings',
  crApplyEyebrow:'Apply', crApplyTitle:'Send us your CV', crApplyLead:'Apply for a role above, or send a general application and we will keep it on file.', crEmailLbl:'Or email', crRole:'Role', crGeneral:'General application', crCv:'CV', dropCv:'Choose your CV or drop it here', dropCvHint:'PDF or Word, up to 10 MB', crSend:'Send application', crDoneTitle:'Application ready', crDoneText:'On the live site your application goes to the HR team. This prototype does not send anything.', apply:'Apply',
  ctEyebrow:'Contact', ctTitle:'Tell us about your site', ctLead:'Use the form for a quote, or reach an office directly.',
  replyTime:'We reply within [[1 working day]]', reqNote:'All fields required unless marked optional',
  st1:'Service', st2:'The job', st3:'Your details', st4:'Review',
  q1:'What do you need?', q2:'About the job', q3:'How can we reach you?', q4:'Check and send',
  eSvc:'Choose a service to continue.', fCountry:'Country', fChoose:'Choose…', fSite:'Site or city', fSitePh:'e.g. Bonaberi, Douala', optional:'(optional)',
  fTime:'When do you need it?', tAsap:'As soon as possible', t13:'In 1–3 months', t36:'In 3–6 months', tPlan:'Still planning',
  fDetails:'Describe the work', fDetailsPh:'Number of sites, equipment, current problem…',
  fFiles:'Drawings, BOQ or site photos', dropQ:'Choose files or drop them here', dropQHint:'Up to 5 files, 10 MB each · PDF, images, Excel, Word, DWG, ZIP',
  fName:'Full name', fCompany:'Company', fEmail:'Email', fPhone:'Phone or WhatsApp',
  eReq:'This field is required.', eEmail:'Enter an email like name@company.com.', ePhone:'Enter a phone number with country code, e.g. +237 6…', eDetails:'Add a few words about the work (at least 15 characters).',
  eTooBig:n=>`${n} is larger than 10 MB.`, eTooMany:'You can attach up to 5 files.', eCv:'Attach your CV.',
  back:'Back', next:'Continue', send:'Send request',
  rService:'Service', rCountry:'Country', rSite:'Site', rTime:'Timing', rDetails:'Details', rFiles:'Files', rName:'Name', rCompany:'Company', rEmail:'Email', rPhone:'Phone',
  doneTitle:'Request ready', doneText:'On the live site this request goes to info@gratoengineering.com and you receive a confirmation email in your language. This prototype does not send anything.', doneAgain:'Start a new request',
  notSure:'Not sure yet', notSureSub:'We’ll help you scope it',
  trustTitle:'Why send your request to Grato', talkTitle:'Prefer to talk?', talkText:'Message our team on WhatsApp with a photo of the site or your questions.', talkBtn:'Chat on WhatsApp',
  hq:'Head office', ro:'Regional office', copy:'Copy', copied:'Copied', tel:'Tel', email:'Email', hours:'Hours', waLbl:'WhatsApp',
  ftrLine:'Telecom infrastructure, power, generator sales, connectivity and managed services for operators and enterprises in Cameroon, Nigeria and Francophone Africa.',
  ftrCompany:'Company', ftrOffices:'Offices', ftrFollow:'Follow us', ftrReg:'NCC licence INT/017/22 · RCCM [[number]] · CAC RC [[number]]'
},
fr: {
  proto:'Prototype. Le texte en pointillés est provisoire et attend une information confirmée.',
  protoToggle:'Surligner les éléments provisoires',
  navAbout:'À propos', navServices:'Services', navProjects:'Projets', navPartners:'Partenaires', navNews:'Actualités', navCareers:'Carrières', navContact:'Contact',
  megaEyebrow:'Notre méthode', megaTitle:'De l’étude à la maintenance', megaText:'Chaque service suit un déploiement en cinq étapes, avec un livrable clair à chaque étape.', megaLink:'Tous les services',
  ctaQuote:'Demander un devis', ctaServices:'Découvrir nos services', ctaCall:'Nous appeler ou nous rendre visite', abCall:'Appeler', abQuote:'Devis',
  altHero:'Champ solaire à côté d’un pylône télécom treillis sur le site de Kalakfra', tagSolar:'SOLAIRE HYBRIDE',
  heroEyebrow:'Télécoms · Énergie · Connectivité — Cameroun et Nigeria',
  heroTitle:'Bâtir les infrastructures. <em>Alimenter</em> la connectivité.',
  heroLead:'Depuis 2002, Grato Engineering construit, alimente et maintient des sites télécoms pour les opérateurs et les towercos au Cameroun, au Nigeria et en Afrique francophone.',
  stYears:'Années d’activité', stBuilt:'Pylônes construits', stMaint:'Pylônes maintenus', stCountries:'Pays d’implantation',
  licLabel:'Licences de la NCC', licIsp:'FAI · INT/017/22', licColo:'Colocation', licShare:'Partage d’infrastructures',
  svcEyebrow:'Nos métiers', svcTitle:'Six métiers, un seul partenaire responsable', gnRangeEyebrow:'Gamme', gnRangeTitle:'Des groupes pour chaque besoin', gnRangeNote:'Gammes indicatives ; [[confirmer les puissances proposées par Grato]].', gnBrandTitle:'Marques proposées', gnSectorTitle:'Nos clients', gnAfterEyebrow:'Après la vente', gnAfterTitle:'Nous l’installons, l’entretenons et gardons les pièces en stock', gnSizeEyebrow:'Outil de dimensionnement', gnSizeTitle:'Estimez la puissance de groupe nécessaire', gnSizeLead:'Indiquez la puissance totale des équipements à alimenter. Nous dimensionnons avec un facteur de puissance de 0,8 et 25 % de marge, puis arrondissons à une puissance standard.', gnLoad:'Charge totale à alimenter', gnMode:'Achat ou location ?', gnBuy:'Achat', gnRent:'Location', gnResult:'Puissance recommandée', gnBand:'Adapté à', gnCalc:n=>`${n} kW ÷ 0,8 × 1,25`, gnHint:'Vous ne connaissez pas votre charge ? Envoyez-nous la liste de vos équipements ou une facture d’électricité et nous la dimensionnerons pour vous.', gnQuote:'Demander un devis pour cette puissance', gnRentQuote:'Demander un devis de location', gnLargeNote:'Au-delà de 2 000 kVA, nous concevons un système multi-groupes.', gcLabel:'Photos de groupes', gcPrev:'Photo précédente', gcNext:'Photo suivante', gcPause:'Mettre en pause', gcPlay:'Lecture', gcPhoto:'Photo à fournir', gcGo:'Afficher la photo', gcCredit:'Photo', gcOwn:'Photo : site Grato', gcStock:'Photos d’exemple issues de Wikimedia Commons ; [[à remplacer par des photos du stock Grato]].', more:'Voir le détail',
  roEyebrow:'Le déroulé d’un projet', roTitle:'Cinq étapes, une seule équipe, un livrable à chaque étape', roLead:'Sélectionnez une étape pour voir ce que nous faisons et ce que vous recevez.', roYou:'Vous recevez', roStage:'Étape',
  bandEyebrow:'Entrepôt de Bonaberi', bandTitle:'Une seule équipe, de l’entrepôt au sommet du pylône.', bandF1:'Équipements stockés à Bonaberi', bandF2:'Ingénieurs à Douala et Abuja', bandF3:'Un seul contrat pour tout le déploiement',
  mapEyebrow:'Implantation', mapTitle:'Où nous intervenons', mapLead:'Siège à Douala, bureau régional à Abuja et équipes terrain dans les deux pays. Sélectionnez un repère ou une fiche.',
  mapCm:'CAMEROUN', mapSea:'Golfe de Guinée', mapLugbe:'Lugbe · génie civil 2025', lgOffice:'Bureau', lgProject:'Site de projet (à compléter)',
  projEyebrow:'Sur le terrain', projTitle:'Travaux récents sur site', projAll:'Tous les projets', readCase:'Lire l’étude de cas', quickView:'Aperçu',
  tmQuote:'Un court témoignage d’un opérateur ou d’une towerco sur un projet Grato, en attente d’accord.', tmWho:'Nom, fonction, entreprise', nhEyebrow:'Actualités', nhTitle:'Les dernières nouvelles de Grato', nhAll:'Toutes les actualités', slideOf:'Diapositive', pause:'Mettre en pause', play:'Lecture', roAuto:'Lecture auto',
  whyEyebrow:'Pourquoi Grato', whyTitle:'Pourquoi les opérateurs nous font confiance',
  ptEyebrow:'Écosystème', ptTitle:'Partenaires et clients', ptAll:'Tous les partenaires', ptRowPartners:'Partenaires technologiques et fournisseurs', ptRowClients:'Clients', toConfirm:'à confirmer',
  ctaBandTitle:'Un déploiement en vue ou besoin d’un appui sur site ?', ctaBandText:'Décrivez votre projet et notre équipe vous recontactera.',
  abEyebrow:'À propos de Grato', abTitle:'Une entreprise d’ingénierie bâtie sur le terrain depuis 2002',
  abP1:'Grato Engineering a démarré le 1er juillet 2002 sous le nom de Grato Engineering Ventures, en résolvant les problèmes d’infrastructure quotidiens des opérateurs télécoms. L’entreprise a été constituée en Grato Engineering Global Limited en 2010.',
  abP2:'Aujourd’hui, elle construit et maintient des pylônes, fournit et installe des systèmes d’énergie, assure la connectivité, gère des services techniques et achemine des équipements entre les pays.',
  abP3:'Elle s’appuie sur un siège à Douala (Cameroun), un bureau régional à Abuja (Nigeria) et un entrepôt à Bonaberi qui garde les équipements au plus près des sites.',
  altWarehouse:'Shelters, armoires et chariot élévateur dans la cour de l’entrepôt Grato', capWarehouse:'Shelters, armoires et groupes prêts à l’expédition · cour de l’entrepôt Grato',
  tlEyebrow:'Repères', tlTitle:'D’une entreprise locale à un partenaire régional', tlLead:'Les années en pointillés restent à confirmer.',
  vision:'Vision', mission:'Mission',
  visionText:'Réduire la fracture numérique et donner aux personnes et aux communautés les moyens d’un développement durable au Cameroun, au Nigeria et en Afrique.',
  missionText:'Améliorer les conditions de vie et transformer les communautés grâce à des programmes et des interventions fondés sur la technologie.',
  valEyebrow:'Valeurs', valTitle:'Notre façon de travailler', ldEyebrow:'Direction', ldTitle:'Les responsables de la réalisation',
  qsEyebrow:'Qualité, sécurité, conformité', qsTitle:'Des références vérifiables', qsLead:'Les numéros de licence et d’enregistrement sont publiés pour que les équipes achats puissent les vérifier.',
  lcTitle:'Licences et enregistrements', lcH1:'Licence', lcH2:'Délivrée par', lcH3:'Référence', lcScope:'Objet',
  profileBtn:'Télécharger la plaquette (PDF) — disponible au lancement',
  svEyebrow:'Services', svTitle:'Infrastructures, énergie, groupes électrogènes, connectivité et les équipes pour les exploiter', svLead:'Six métiers qui partagent un même processus de déploiement : un seul partenaire mène le site de l’étude à la maintenance.',
  deliv:'Ce que nous livrons', how:'Notre méthode', related:'Partenaires sur ce service', relProj:'Projets liés', quoteThis:'Demander un devis pour ce service', prev:'Service précédent', next2:'Service suivant', svcCount:'Service',
  photoReal:'Photo : site Grato', photoProfile:'Visuel de la plaquette, à remplacer par une photo réelle',
  pjEyebrow:'Projets', pjTitle:'Nos réalisations sur le terrain', pjLead:'De vraies photos de sites Grato. Filtrez par service, ouvrez un aperçu ou lisez l’étude de cas complète.',
  fService:'Service', fCountry2:'Pays', all:'Tous', cCm:'Cameroun', cNg:'Nigeria', cTbc:'À confirmer', cOther:'Autre',
  noRes:'Aucun projet ne correspond encore à ces filtres.', count:n=>`${n} projet${n>1?'s':''} affiché${n>1?'s':''}`,
  lbWhere:'Lieu', lbYear:'Année', lbCountry:'Pays', lbClient:'Client', lbScope:'Périmètre', lbService:'Service', ifApproved:'Si autorisé', photoSupply:'Photo à fournir',
  csChallenge:'Enjeu', csSolution:'Solution', csResult:'Résultat', csFacts:'Fiche projet', csSimilar:'Un projet similaire ?', csMore:'Autres projets', csBack:'Tous les projets',
  csChallengePh:'Quel était le besoin du client et la difficulté ? ex. réseau électrique instable, délai de déploiement serré, site difficile d’accès.',
  csResultPh:'Le résultat mesuré, ex. heures de groupe réduites de 40 %, réception deux semaines en avance, aucun incident de sécurité.',
  paEyebrow:'Partenaires', paTitle:'Aux côtés de constructeurs et d’opérateurs reconnus', paLead:'Nos partenariats donnent à Grato un accès direct aux équipements et aux pièces, et offrent aux clients un interlocuteur local unique.',
  paFinance:'Partenaire financier', paFinanceKind:'Banque', paFinanceText:'Accompagne les opérations de Grato et le financement de ses projets au Cameroun.', paLogoNote:'[[Confirmer l’accord de chaque entreprise pour l’affichage de son logo avant le lancement.]]',
  nwEyebrow:'Actualités', nwTitle:'Les nouvelles de Grato', nwLead:'Partenariats, licences et travaux sur site. Les dates en pointillés restent à confirmer.',
  crEyebrow:'Carrières', crTitle:'Construisez les réseaux qu’utilisent vos voisins', crLead:'Grato recrute des ingénieurs, des techniciens et des chefs de chantier au Cameroun et au Nigeria.',
  crOpenEyebrow:'Postes ouverts', crOpenTitle:'Offres en cours', crExampleNote:'Exemples de postes, à remplacer par les vraies offres',
  crApplyEyebrow:'Postuler', crApplyTitle:'Envoyez-nous votre CV', crApplyLead:'Postulez à une offre ci-dessus ou envoyez une candidature spontanée que nous conserverons.', crEmailLbl:'Ou par e-mail', crRole:'Poste', crGeneral:'Candidature spontanée', crCv:'CV', dropCv:'Choisissez votre CV ou déposez-le ici', dropCvHint:'PDF ou Word, 10 Mo maximum', crSend:'Envoyer la candidature', crDoneTitle:'Candidature prête', crDoneText:'Sur le site en ligne, votre candidature est envoyée à l’équipe RH. Ce prototype n’envoie rien.', apply:'Postuler',
  ctEyebrow:'Contact', ctTitle:'Parlez-nous de votre site', ctLead:'Utilisez le formulaire pour un devis, ou contactez directement un bureau.',
  replyTime:'Réponse sous [[1 jour ouvré]]', reqNote:'Tous les champs sont obligatoires sauf mention contraire',
  st1:'Service', st2:'Le projet', st3:'Vos coordonnées', st4:'Vérification',
  q1:'De quoi avez-vous besoin ?', q2:'À propos du projet', q3:'Comment vous joindre ?', q4:'Vérifier et envoyer',
  eSvc:'Choisissez un service pour continuer.', fCountry:'Pays', fChoose:'Choisir…', fSite:'Site ou ville', fSitePh:'ex. Bonaberi, Douala', optional:'(facultatif)',
  fTime:'Pour quand ?', tAsap:'Dès que possible', t13:'Dans 1 à 3 mois', t36:'Dans 3 à 6 mois', tPlan:'En phase de réflexion',
  fDetails:'Décrivez les travaux', fDetailsPh:'Nombre de sites, équipements, problème actuel…',
  fFiles:'Plans, DQE ou photos du site', dropQ:'Choisissez des fichiers ou déposez-les ici', dropQHint:'5 fichiers maximum, 10 Mo chacun · PDF, images, Excel, Word, DWG, ZIP',
  fName:'Nom complet', fCompany:'Entreprise', fEmail:'E-mail', fPhone:'Téléphone ou WhatsApp',
  eReq:'Ce champ est obligatoire.', eEmail:'Saisissez un e-mail du type nom@entreprise.com.', ePhone:'Saisissez un numéro avec l’indicatif du pays, ex. +237 6…', eDetails:'Ajoutez quelques mots sur les travaux (15 caractères minimum).',
  eTooBig:n=>`${n} dépasse 10 Mo.`, eTooMany:'Vous pouvez joindre 5 fichiers maximum.', eCv:'Joignez votre CV.',
  back:'Retour', next:'Continuer', send:'Envoyer la demande',
  rService:'Service', rCountry:'Pays', rSite:'Site', rTime:'Délai', rDetails:'Détails', rFiles:'Fichiers', rName:'Nom', rCompany:'Entreprise', rEmail:'E-mail', rPhone:'Téléphone',
  doneTitle:'Demande prête', doneText:'Sur le site en ligne, cette demande est envoyée à info@gratoengineering.com et vous recevez un e-mail de confirmation dans votre langue. Ce prototype n’envoie rien.', doneAgain:'Nouvelle demande',
  notSure:'Je ne sais pas encore', notSureSub:'Nous vous aidons à le définir',
  trustTitle:'Pourquoi confier votre demande à Grato', talkTitle:'Vous préférez en parler ?', talkText:'Écrivez à notre équipe sur WhatsApp avec une photo du site ou vos questions.', talkBtn:'Discuter sur WhatsApp',
  hq:'Siège', ro:'Bureau régional', copy:'Copier', copied:'Copié', tel:'Tél.', email:'E-mail', hours:'Horaires', waLbl:'WhatsApp',
  ftrLine:'Infrastructures télécoms, énergie, vente de groupes électrogènes, connectivité et services gérés pour les opérateurs et les entreprises au Cameroun, au Nigeria et en Afrique francophone.',
  ftrCompany:'Entreprise', ftrOffices:'Bureaux', ftrFollow:'Suivez-nous', ftrReg:'Licence NCC INT/017/22 · RCCM [[numéro]] · CAC RC [[numéro]]'
}};

export const SVCS = [
 {id:'telecom', ic:'tower', img:'lattice-tower', real:true, partners:['IHS Nigeria','IHS Cameroon','JMG','Orbit Fabrication'],
  en:{n:'Telecom Infrastructure', s:'BTS deployment, shelters, collocation, and tower repair and maintenance.', p:'We have built over [[150]] towers and maintain over [[250]] across Cameroon and Nigeria.',
      d:['BTS site deployment','Power and equipment cabinets','Equipment shelters','Site build and modernisation','Infrastructure sharing and collocation','Passive infrastructure','Tower repair and maintenance']},
  fr:{n:'Infrastructures télécoms', s:'Déploiement BTS, shelters, colocation, réparation et maintenance de pylônes.', p:'Nous avons construit plus de [[150]] pylônes et en maintenons plus de [[250]] au Cameroun et au Nigeria.',
      d:['Déploiement de sites BTS','Armoires d’énergie et d’équipements','Shelters d’équipements','Construction et modernisation de sites','Partage d’infrastructures et colocation','Infrastructures passives','Réparation et maintenance de pylônes']}},
 {id:'energy', ic:'power', img:'solar-tower', real:true, partners:['Exicom','Mikano International','Greaves Power','Mahindra'],
  en:{n:'Energy & Power', s:'Lithium batteries, rectifiers, hybrid and solar systems, and Mikano generators.', p:'Reliable power that keeps sites on air and cuts fuel costs.',
      d:['Lithium battery systems','Rectifiers and DC power systems','ATS and power management','DC air conditioning','Hybrid and solar systems','Mikano generators, coupled and assembled in Bonaberi','Intelligent monitoring']},
  fr:{n:'Énergie', s:'Batteries lithium, redresseurs, systèmes hybrides et solaires, groupes Mikano.', p:'Une énergie fiable qui maintient les sites en service et réduit les coûts de carburant.',
      d:['Systèmes de batteries lithium','Redresseurs et systèmes d’énergie DC','ATS et gestion de l’énergie','Climatisation DC','Systèmes hybrides et solaires','Groupes Mikano, couplés et assemblés à Bonaberi','Supervision intelligente']}},
 {id:'connectivity', ic:'globe', img:'data-centre', real:false, partners:[],
  en:{n:'Connectivity & ICT', s:'Broadband, dedicated internet, fibre, Wi-Fi and 4G/5G infrastructure.', p:'High-speed internet for underserved areas, campuses and businesses.',
      d:['Broadband internet services','Enterprise and dedicated internet access','Managed network services','Wi-Fi and wireless solutions','Fibre optic solutions','4G LTE and 5G infrastructure','Cybersecurity solutions']},
  fr:{n:'Connectivité et TIC', s:'Haut débit, internet dédié, fibre, Wi-Fi et infrastructures 4G/5G.', p:'Un internet haut débit pour les zones mal desservies, les campus et les entreprises.',
      d:['Services internet haut débit','Accès internet dédié pour entreprises','Services réseau gérés','Solutions Wi-Fi et sans fil','Solutions fibre optique','Infrastructures 4G LTE et 5G','Solutions de cybersécurité']}},
 {id:'managed', ic:'wrench', img:'technician', real:false, partners:['Exicom'],
  en:{n:'Managed Technical Services', s:'Installation, preventive and corrective maintenance, NOC support and field engineering.', p:'Field and remote teams that keep networks available.',
      d:['Installation and integration','Operations and maintenance','Preventive maintenance','Corrective maintenance','Technical support (NOC/ROC)','Remote monitoring','Field engineering services']},
  fr:{n:'Services techniques gérés', s:'Installation, maintenance préventive et corrective, support NOC et ingénierie terrain.', p:'Des équipes terrain et à distance qui assurent la disponibilité des réseaux.',
      d:['Installation et intégration','Exploitation et maintenance','Maintenance préventive','Maintenance corrective','Support technique (NOC/ROC)','Supervision à distance','Ingénierie terrain']}},
 {id:'logistics', ic:'truck', img:'warehouse', real:true, partners:['IHS Nigeria','IHS Cameroon'],
  en:{n:'Logistics & Transportation', s:'Import-export, transport of tower components and in-country warehousing.', p:'Equipment moved across borders and delivered to site on time.',
      d:['Import-export licences in Nigeria and Cameroon','Transport of tower components for IHS and other operators','In-country warehousing in Bonaberi','DDP supply of equipment [[scope to confirm]]']},
  fr:{n:'Logistique et transport', s:'Import-export, transport d’éléments de pylônes et entreposage local.', p:'Des équipements acheminés entre les pays et livrés sur site dans les délais.',
      d:['Licences d’import-export au Nigeria et au Cameroun','Transport d’éléments de pylônes pour IHS et d’autres opérateurs','Entreposage local à Bonaberi','Fourniture d’équipements DDP [[périmètre à confirmer]]']}},
 {id:'generators', ic:'genset', img:'genset-yard', real:true, partners:['Mikano International','Greaves Power','Mahindra'],
  en:{n:'Generator Sales', s:'New generators from Mikano, Greaves and Mahindra, installed, serviced and available to rent.', p:'Generators sized for your load, delivered, installed and kept running by Grato engineers in Cameroon and Nigeria.',
      d:['New diesel generators from Mikano, Greaves and Mahindra','Sizing based on your actual load','Delivery, siting and connection with ATS changeover','Commissioning and load testing','Maintenance contracts and genuine spare parts','Short-term and long-term rental']},
  fr:{n:'Vente de groupes électrogènes', s:'Groupes neufs Mikano, Greaves et Mahindra, installés, entretenus et disponibles à la location.', p:'Des groupes dimensionnés selon votre charge, livrés, installés et maintenus en service par les ingénieurs Grato au Cameroun et au Nigeria.',
      d:['Groupes diesel neufs Mikano, Greaves et Mahindra','Dimensionnement selon votre charge réelle','Livraison, implantation et raccordement avec inverseur ATS','Mise en service et essais en charge','Contrats de maintenance et pièces d’origine','Location courte et longue durée']}}
];
export const STEPS = {en:[['Survey','Site visit, measurements and needs.'],['Design & supply','Engineering design and equipment from OEM partners.'],['Install & integrate','Civil, electrical and telecom works, tested and handed over.'],['Operate & maintain','Preventive visits, fault response and reporting.']],
  fr:[['Étude de site','Visite, relevés et besoins.'],['Conception et fourniture','Ingénierie et équipements de nos partenaires constructeurs.'],['Installation et intégration','Travaux civils, électriques et télécoms, testés et réceptionnés.'],['Exploitation et maintenance','Visites préventives, dépannages et rapports.']]};
export const ROLLOUT = [
 {ic:'pin', en:['Survey & feasibility','Site visit, power audit, structural checks and access assessment.','Survey report with photos and recommendations'], fr:['Étude et faisabilité','Visite du site, audit énergétique, contrôles structurels et évaluation des accès.','Rapport d’étude avec photos et recommandations']},
 {ic:'doc', en:['Design & BOQ','Engineering drawings, power sizing and a bill of quantities.','Drawings, BOQ and a firm quotation'], fr:['Conception et DQE','Plans d’ingénierie, dimensionnement énergétique et devis quantitatif estimatif.','Plans, DQE et devis ferme']},
 {ic:'truck', en:['Supply & logistics','Equipment from OEM partners, import and customs, staging in Bonaberi, delivery to site.','Delivery schedule with status updates'], fr:['Fourniture et logistique','Équipements de nos partenaires, import et dédouanement, stockage à Bonaberi, livraison sur site.','Calendrier de livraison avec suivi']},
 {ic:'hard', en:['Build & integrate','Civil works, tower and shelter installation, power and telecom integration, testing.','Test reports and as-built documents'], fr:['Construction et intégration','Génie civil, pose du pylône et du shelter, intégration énergie et télécoms, essais.','Rapports d’essais et dossier de récolement']},
 {ic:'wrench', en:['Handover & maintain','Acceptance with the client, then preventive and corrective maintenance with NOC support.','Acceptance certificate and maintenance reports'], fr:['Réception et maintenance','Réception avec le client, puis maintenance préventive et corrective avec support NOC.','PV de réception et rapports de maintenance']}
];

export const PROJECTS = [
 {slug:'kalakfra-solar', img:'solar-tower', svc:'energy', country:'tbc', year:'2024', where:'Kalakfra · IHS KSR_125', case:true,
  en:{t:'Solar hybrid power at a tower site', d:'Ground-mounted solar array installed inside the compound of an IHS tower site.', sol:'Grato installed a ground-mounted solar array inside the site compound, alongside the existing tower and equipment, to supply the site’s DC power system.'},
  fr:{t:'Énergie solaire hybride sur un site pylône', d:'Champ solaire au sol installé dans l’enceinte d’un site pylône IHS.', sol:'Grato a installé un champ solaire au sol dans l’enceinte du site, à côté du pylône et des équipements, pour alimenter le système d’énergie DC du site.'}},
 {slug:'lugbe-civil', img:'civil-works', svc:'telecom', country:'ng', year:'2025', where:'Airport Road, Lugbe, Abuja', case:true,
  en:{t:'Site civil works, Airport Road', d:'Perimeter wall and fencing works at a telecom site in Lugbe, September 2025.', sol:'Grato’s civil team built the perimeter wall foundation and installed chain-link fencing around the telecom site.'},
  fr:{t:'Génie civil de site, Airport Road', d:'Travaux de mur d’enceinte et de clôture sur un site télécom à Lugbe, septembre 2025.', sol:'L’équipe génie civil de Grato a réalisé la fondation du mur d’enceinte et posé la clôture grillagée autour du site télécom.'}},
 {slug:'warehouse', img:'warehouse', svc:'logistics', country:'tbc', year:'[[2025]]', where:'Grato warehouse yard', case:true,
  en:{t:'Equipment warehousing and dispatch', d:'Shelters, cabinets and generator sets staged in the yard before dispatch to sites.', sol:'Shelters, cabinets and generator sets are received, checked and staged in the Grato yard, then dispatched to sites with forklift loading on site.'},
  fr:{t:'Entreposage et expédition d’équipements', d:'Shelters, armoires et groupes électrogènes stockés dans la cour avant expédition vers les sites.', sol:'Les shelters, armoires et groupes sont réceptionnés, contrôlés et stockés dans la cour de Grato, puis expédiés vers les sites avec chargement par chariot élévateur.'}},
 {slug:'kalakfra-tower', img:'tower-shelter', svc:'telecom', country:'tbc', year:'2024', where:'Kalakfra · IHS KSR_125', case:true,
  en:{t:'Tower, shelter and solar at site KSR_125', d:'Lattice tower with equipment shelter and solar panels, photographed in April 2024.', sol:'The site combines a lattice tower, an equipment shelter and solar panels inside a fenced compound.'},
  fr:{t:'Pylône, shelter et solaire, site KSR_125', d:'Pylône treillis avec shelter d’équipements et panneaux solaires, photographié en avril 2024.', sol:'Le site associe un pylône treillis, un shelter d’équipements et des panneaux solaires dans une enceinte clôturée.'}},
 {slug:'genset', img:'genset-yard', svc:'generators', country:'tbc', year:'[[2025]]', where:'[[Grato yard]]', case:true,
  en:{t:'Generator set ready for deployment', d:'Enclosed generator set at the Grato yard after coupling and checks.', sol:'Generator sets are coupled, assembled and checked at the Grato yard before they are sent to site.'},
  fr:{t:'Groupe électrogène prêt au déploiement', d:'Groupe électrogène capoté au dépôt Grato après couplage et contrôles.', sol:'Les groupes électrogènes sont couplés, assemblés et contrôlés au dépôt Grato avant leur envoi sur site.'}},
 {slug:'lattice', img:'lattice-tower', svc:'telecom', country:'tbc', year:'[[20__]]', where:'[[Site to confirm]]', case:true,
  en:{t:'Lattice tower maintenance', d:'Self-supporting lattice tower on Grato’s maintenance programme.', sol:'Grato maintains the self-supporting lattice tower under its preventive and corrective maintenance programme.'},
  fr:{t:'Maintenance de pylône treillis', d:'Pylône treillis autoportant suivi dans le programme de maintenance de Grato.', sol:'Grato assure la maintenance préventive et corrective du pylône treillis autoportant.'}},
 {slug:'', img:null, svc:'connectivity', country:'tbc', year:'[[20__]]', where:'[[Site to confirm]]', case:false,
  en:{t:'Connectivity project', d:'Add a broadband, fibre or Wi-Fi project with its photo here.'}, fr:{t:'Projet de connectivité', d:'Ajoutez ici un projet haut débit, fibre ou Wi-Fi avec sa photo.'}},
 {slug:'', img:null, svc:'managed', country:'tbc', year:'[[20__]]', where:'[[Site to confirm]]', case:false,
  en:{t:'Managed services contract', d:'Add a maintenance or NOC contract with its scope and photo here.'}, fr:{t:'Contrat de services gérés', d:'Ajoutez ici un contrat de maintenance ou de NOC avec son périmètre et sa photo.'}}
];
export const HERO = [
 {img:'solar-tower', to:'energy', tag:'SITE KALAKFRA · IHS_KSR_125 · 04/2024',
  en:['Telecom · Power · Connectivity — Cameroon & Nigeria','Building infrastructure. <em>Powering</em> connectivity.','Since 2002, Grato Engineering has built, powered and maintained telecom sites for operators and tower companies across Cameroon, Nigeria and Francophone Africa.','Explore services','#services'],
  fr:['Télécoms · Énergie · Connectivité — Cameroun et Nigeria','Bâtir les infrastructures. <em>Alimenter</em> la connectivité.','Depuis 2002, Grato Engineering construit, alimente et maintient des sites télécoms pour les opérateurs et les towercos au Cameroun, au Nigeria et en Afrique francophone.','Découvrir nos services','#services']},
 {img:'warehouse', tag:'GRATO WAREHOUSE YARD · STAGING',
  en:['Logistics & warehousing','Equipment staged locally, <em>delivered</em> to site.','Shelters, cabinets and generators are received, checked and held in our yard, then dispatched to operators’ sites in Cameroon and Nigeria.','Logistics services','#logistics'],
  fr:['Logistique et entreposage','Des équipements stockés sur place, <em>livrés</em> sur site.','Shelters, armoires et groupes sont réceptionnés, contrôlés et stockés dans notre cour, puis expédiés vers les sites des opérateurs au Cameroun et au Nigeria.','Services logistiques','#logistics']},
 {img:'civil-works', tag:'AIRPORT ROAD · LUGBE, ABUJA · 09/2025',
  en:['Telecom infrastructure','Sites built to last, from the <em>foundations</em> up.','Civil works, fencing, towers and shelters delivered by our own teams and handed over with full documentation.','See the case study','#case-lugbe-civil'],
  fr:['Infrastructures télécoms','Des sites bâtis pour durer, dès les <em>fondations</em>.','Génie civil, clôtures, pylônes et shelters réalisés par nos propres équipes et réceptionnés avec un dossier complet.','Voir l’étude de cas','#case-lugbe-civil']},
 {img:'genset-yard', tag:'GENERATOR STAGING · GRATO YARD',
  en:['Generator sales & rental','Generators for sale, <em>installed</em> and serviced.','Mikano, Greaves and Mahindra generators sized to your load, delivered, installed and maintained by our engineers. Rental available.','Shop generators','#generators'],
  fr:['Vente et location de groupes','Des groupes en vente, <em>installés</em> et entretenus.','Groupes Mikano, Greaves et Mahindra dimensionnés selon votre charge, livrés, installés et entretenus par nos ingénieurs. Location possible.','Voir les groupes','#generators']}
];
export const TESTI = [
 {en:['A short quote from an operator contact about a Grato rollout, awaiting approval.','Name, title · Mobile operator'], fr:['Un court témoignage d’un opérateur sur un déploiement Grato, en attente d’accord.','Nom, fonction · Opérateur mobile']},
 {en:['A short quote from a tower-company contact about maintenance or uptime, awaiting approval.','Name, title · Tower company'], fr:['Un court témoignage d’une towerco sur la maintenance ou la disponibilité, en attente d’accord.','Nom, fonction · Towerco']},
 {en:['A short quote from an OEM partner about working with Grato in Cameroon, awaiting approval.','Name, title · OEM partner'], fr:['Un court témoignage d’un partenaire constructeur sur la collaboration avec Grato au Cameroun, en attente d’accord.','Nom, fonction · Partenaire constructeur']}
];
export const METRICS = {
 telecom:{en:['Days to handover','Sites','Uptime after handover'], fr:['Jours jusqu’à la réception','Sites','Disponibilité après réception']},
 energy:{en:['Solar capacity (kWp)','Generator hours saved','Sites'], fr:['Puissance solaire (kWc)','Heures de groupe évitées','Sites']},
 generators:{en:['Rating (kVA)','Hours to commission','Sites supplied'], fr:['Puissance (kVA)','Heures de mise en service','Sites équipés']},
 logistics:{en:['Items dispatched','Average lead time','Countries'], fr:['Équipements expédiés','Délai moyen','Pays']}
};
export const WHY = [
 ['loop','End-to-end delivery','One partner for supply, installation, integration, operation and maintenance.','Livraison de bout en bout','Un seul partenaire pour la fourniture, l’installation, l’intégration, l’exploitation et la maintenance.'],
 ['pin','Local teams','Offices and field engineers in Cameroon and Nigeria for fast response.','Équipes locales','Bureaux et ingénieurs terrain au Cameroun et au Nigeria pour une intervention rapide.'],
 ['store','In-country warehousing','Stock held in Bonaberi shortens lead times and site downtime.','Entreposage local','Le stock de Bonaberi réduit les délais et les interruptions de site.'],
 ['shield','Licensed and compliant','NCC licences for ISP services, collocation and infrastructure sharing.','Agréé et conforme','Licences NCC pour les services FAI, la colocation et le partage d’infrastructures.'],
 ['chip','OEM partnerships','Designated local partner for Exicom in Cameroon; Mikano generator assembly.','Partenariats constructeurs','Partenaire local désigné d’Exicom au Cameroun ; assemblage de groupes Mikano.'],
 ['leaf','Greener sites','Hybrid, solar and lithium systems that lower fuel use and cost of ownership.','Sites plus verts','Systèmes hybrides, solaires et lithium qui réduisent la consommation de carburant et le coût total.']
];
export const PARTNERS = [
 ['IHS Nigeria','Towers','Tower infrastructure deployment, operation and maintenance across Nigeria.','Pylônes','Déploiement, exploitation et maintenance d’infrastructures de pylônes au Nigeria.'],
 ['IHS Cameroon','Towers','Tower deployment, site acquisition and managed services in Cameroon.','Pylônes','Déploiement de pylônes, acquisition de sites et services gérés au Cameroun.'],
 ['Exicom','Power systems','Grato is Exicom’s designated local partner in Cameroon for DDP supply, installation, integration, support and maintenance.','Systèmes d’énergie','Grato est le partenaire local désigné d’Exicom au Cameroun pour la fourniture DDP, l’installation, l’intégration, le support et la maintenance.'],
 ['Mikano International','Generators','Strategic partnership to set up generator assembly operations in Cameroon for faster delivery and local support.','Groupes électrogènes','Partenariat stratégique pour assembler des groupes électrogènes au Cameroun : livraison plus rapide et support local.'],
 ['Greaves Power','Power generation','Gensets, industrial engines and power equipment.','Production d’énergie','Groupes électrogènes, moteurs industriels et équipements d’énergie.'],
 ['JMG','Engineering','Design, manufacturing and integration of telecom, power and structural solutions.','Ingénierie','Conception, fabrication et intégration de solutions télécoms, énergie et structures.'],
 ['Mahindra','Energy','Resilient and sustainable energy solutions.','Énergie','Solutions énergétiques résilientes et durables.'],
 ['Orbit Fabrication Works','Fabrication','Steel structures, enclosures and custom fabrication for infrastructure projects.','Fabrication','Structures métalliques, enveloppes et fabrication sur mesure pour les projets d’infrastructure.']
];
export const CLIENTS = ['MTN','Airtel','Glo','9mobile'];
export const VALUES = [['Integrity','We do what we say and own the result.','Intégrité','Nous faisons ce que nous annonçons et assumons le résultat.'],
 ['Innovation','We look for better ways to power and connect sites.','Innovation','Nous cherchons de meilleures façons d’alimenter et de connecter les sites.'],
 ['Excellence','High standards on every site, at every visit.','Excellence','Des standards élevés sur chaque site, à chaque intervention.'],
 ['Teamwork','We respect each person’s contribution, across cultures.','Esprit d’équipe','Nous respectons la contribution de chacun, au-delà des cultures.'],
 ['Customer focus','We measure our success by our clients’ network uptime.','Orientation client','Nous mesurons notre réussite à la disponibilité des réseaux de nos clients.']];
export const TIMELINE = [['2002','Founded as Grato Engineering Ventures','Started operations on 1 July 2002.','Création de Grato Engineering Ventures','Début des activités le 1er juillet 2002.'],
 ['2010','Incorporated as Grato Engineering Global Limited','Full incorporation of the company.','Constitution de Grato Engineering Global Limited','Constitution de la société.'],
 ['[[20__]]','NCC licences awarded','ISP licence INT/017/22, collocation and infrastructure sharing.','Obtention des licences NCC','Licence FAI INT/017/22, colocation et partage d’infrastructures.'],
 ['[[20__]]','Head office established in Douala','Bonaberi warehouse for generator coupling and staging.','Installation du siège à Douala','Entrepôt de Bonaberi pour le couplage et le stockage des groupes.'],
 ['[[20__]]','Exicom and Mikano partnerships','Designated local partner for Exicom; Mikano generator assembly in Cameroon.','Partenariats Exicom et Mikano','Partenaire local désigné d’Exicom ; assemblage de groupes Mikano au Cameroun.']];
export const CERTS = [
 ['award','[[ISO 9001]]','Quality management, if held.','Management de la qualité, si détenue.'],
 ['hard','[[ISO 45001]]','Occupational health and safety, if held.','Santé et sécurité au travail, si détenue.'],
 ['leaf','[[ISO 14001]]','Environmental management, if held.','Management environnemental, si détenue.'],
 ['shield','[[X]] days','Without a lost-time incident, from site safety records.','Sans accident avec arrêt, selon les registres de sécurité.']];
export const LICS = [['ISP licence','Internet service provider','NCC (Nigeria)','INT/017/22','Licence FAI','Fournisseur d’accès internet','NCC (Nigeria)'],
 ['Collocation licence','Collocation services','NCC (Nigeria)','[[ref.]]','Licence de colocation','Services de colocation','NCC (Nigeria)'],
 ['Infrastructure sharing licence','Shared passive infrastructure','NCC (Nigeria)','[[ref.]]','Licence de partage d’infrastructures','Infrastructures passives partagées','NCC (Nigeria)'],
 ['Import-export licences','Equipment and tower components','Nigeria and Cameroon','[[ref.]]','Licences d’import-export','Équipements et éléments de pylônes','Nigeria et Cameroun'],
 ['Company registration','Grato Engineering Global Limited','CAC (Nigeria)','RC [[number]]','Immatriculation','Grato Engineering Global Limited','CAC (Nigeria)'],
 ['Company registration','Head office, Douala','RCCM (Cameroon)','[[number]]','Immatriculation','Siège, Douala','RCCM (Cameroun)'],
 ['[[Sector registrations]]','[[e.g. ART, MINPOSTEL]]','Cameroon','[[ref.]]','[[Agréments sectoriels]]','[[ex. ART, MINPOSTEL]]','Cameroun']];
export const LOCS = {
 douala:{tag:['Head office','Siège'], h:['Douala, Cameroon','Douala, Cameroun'], p:['95 Rue 4443, Ancienne Route, Bonaberi. Head office and the Bonaberi warehouse for generator coupling, assembly and equipment staging.','95 Rue 4443, Ancienne Route, Bonaberi. Siège et entrepôt de Bonaberi pour le couplage, l’assemblage de groupes et le stockage d’équipements.'], c:'4.0859° N, 9.6656° E'},
 abuja:{tag:['Regional office','Bureau régional'], h:['Abuja, Nigeria','Abuja, Nigeria'], p:['Success Plaza, Plot 523, Sylvester Ugoh Crescent, Jabi.','Success Plaza, Plot 523, Sylvester Ugoh Crescent, Jabi.'], c:'9.07° N, 7.42° E'},
 lugbe:{tag:['Project site','Site de projet'], h:['Lugbe, Abuja','Lugbe, Abuja'], p:['Perimeter wall and fencing works at a telecom site on Airport Road, September 2025.','Mur d’enceinte et clôture d’un site télécom sur Airport Road, septembre 2025.'], c:'8.9654° N, 7.3394° E', proj:'lugbe-civil'},
 franco:{tag:['Markets served','Marchés desservis'], h:['Francophone Africa','Afrique francophone'], p:['[[Countries served beyond Cameroon to be listed]].','[[Pays desservis hors Cameroun à préciser]].'], c:null}
};
export const NEWS = [
 {lead:true, img:'warehouse', cat:['Partnership','Partenariat'], date:'[[date]]', en:['Grato named Exicom’s designated local partner in Cameroon','Grato now handles DDP supply, installation, integration, operational support and maintenance of Exicom power systems in Cameroon, from power cables and rectifiers to lithium batteries and DC air conditioners.'], fr:['Grato désigné partenaire local d’Exicom au Cameroun','Grato assure désormais la fourniture DDP, l’installation, l’intégration, le support et la maintenance des systèmes d’énergie Exicom au Cameroun, des câbles et redresseurs aux batteries lithium et climatiseurs DC.']},
 {cat:['Products','Produits'], date:'[[date]]', en:['Grato now sells and rents generators','New Mikano, Greaves and Mahindra generators for homes, businesses, telecom sites and public buildings, with installation, maintenance contracts, spare parts and rental.'], fr:['Grato vend et loue désormais des groupes électrogènes','Groupes neufs Mikano, Greaves et Mahindra pour particuliers, entreprises, sites télécoms et bâtiments publics, avec installation, contrats de maintenance, pièces détachées et location.']},
 {cat:['Partnership','Partenariat'], date:'[[date]]', en:['Mikano partnership brings generator assembly to Cameroon','A strategic partnership with Mikano International sets up generator assembly in Cameroon for faster delivery and local support.'], fr:['Le partenariat Mikano amène l’assemblage de groupes au Cameroun','Un partenariat stratégique avec Mikano International installe l’assemblage de groupes au Cameroun pour des livraisons plus rapides et un support local.']},
 {cat:['Company','Entreprise'], date:'[[date]]', en:['Grato partners with Access Bank Cameroon','Access Bank Cameroon supports Grato’s operations and project financing.'], fr:['Grato s’associe à Access Bank Cameroon','Access Bank Cameroon accompagne les opérations et le financement des projets de Grato.']},
 {cat:['On site','Sur le terrain'], date:'Sep 2025', datefr:'sept. 2025', en:['Site civil works on Airport Road, Lugbe','Grato’s civil team built a perimeter wall and fencing at a telecom site in Lugbe, Abuja.'], fr:['Génie civil de site sur Airport Road, Lugbe','L’équipe génie civil de Grato a réalisé un mur d’enceinte et une clôture sur un site télécom à Lugbe, Abuja.']},
 {cat:['Company','Entreprise'], date:'[[date]]', en:['Head office in Douala','Grato’s head office is in Bonaberi, Douala, beside the warehouse, with the regional office in Abuja.'], fr:['Le siège à Douala','Le siège de Grato est à Bonaberi, Douala, à côté de l’entrepôt ; le bureau régional est à Abuja.']}
];
export const JOBS = [
 {en:['Field Technician, Power Systems','Douala · Full time'], fr:['Technicien terrain, systèmes d’énergie','Douala · Temps plein']},
 {en:['Civil Site Supervisor','Abuja · Full time'], fr:['Chef de chantier génie civil','Abuja · Temps plein']},
 {en:['NOC Engineer','Douala · Shifts'], fr:['Ingénieur NOC','Douala · Travail posté']}
];
export const CRWHY = [
 ['tower','Real sites, two countries','Work on towers, power systems and networks in Cameroon and Nigeria.','De vrais sites, deux pays','Travaillez sur des pylônes, des systèmes d’énergie et des réseaux au Cameroun et au Nigeria.'],
 ['chip','Modern equipment','Lithium, hybrid and solar systems alongside telecom and connectivity work.','Des équipements modernes','Systèmes lithium, hybrides et solaires, en plus des travaux télécoms et connectivité.'],
 ['users','Grow with the company','Grato is expanding across Francophone Africa and needs people who can lead.','Grandissez avec l’entreprise','Grato se développe en Afrique francophone et a besoin de personnes capables de diriger.']
];
export const OFFICES = [
 {k:'hq', h:'Douala, Cameroon', hfr:'Douala, Cameroun', a:'95 Rue 4443, Ancienne Route<br>Bonaberi, Douala, Cameroon', afr:'95 Rue 4443, Ancienne Route<br>Bonaberi, Douala, Cameroun', tel:'+237 679 586 444'},
 {k:'ro', h:'Abuja, Nigeria', hfr:'Abuja, Nigeria', a:'Success Plaza, Plot 523<br>Sylvester Ugoh Crescent, Jabi, FCT Abuja', afr:'Success Plaza, Plot 523<br>Sylvester Ugoh Crescent, Jabi, FCT Abuja', tel:'+234 803 281 8658'}
];
export const TRUST = [
 ['shield','Licensed and registered','NCC licences, with numbers you can verify.','Agréé et immatriculé','Licences NCC, avec des numéros vérifiables.'],
 ['clock','A named reply','An engineer, not a call centre, answers your request.','Une réponse nominative','Un ingénieur, pas un centre d’appels, répond à votre demande.'],
 ['pin','Teams on the ground','Douala head office, Abuja regional office, Bonaberi warehouse.','Des équipes sur place','Siège à Douala, bureau régional à Abuja, entrepôt à Bonaberi.'],
 ['lock','Your files stay private','Details and drawings are used only to prepare your quote.','Vos fichiers restent confidentiels','Vos informations et plans servent uniquement à préparer votre devis.']
];

/* Generator sales page */
export const GEN = {
 ranges:[
  {kva:'10–30 kVA', ic:'home', en:['Homes and small offices','Standby power for lighting, fridges, air conditioning and office equipment.'], fr:['Maisons et petits bureaux','Secours pour l’éclairage, le froid, la climatisation et le matériel de bureau.']},
  {kva:'30–150 kVA', ic:'store', en:['Businesses and institutions','Shops, hotels, clinics, schools and banks that cannot afford downtime.'], fr:['Entreprises et institutions','Commerces, hôtels, cliniques, écoles et banques qui ne peuvent pas s’arrêter.']},
  {kva:'10–60 kVA', ic:'tower', en:['Telecom sites','Prime and standby gensets for tower sites, with remote monitoring options.'], fr:['Sites télécoms','Groupes principaux et de secours pour sites pylônes, avec supervision à distance en option.']},
  {kva:'150–1,000+ kVA', ic:'chip', en:['Industry and large buildings','Factories, hospitals, estates and public buildings, including synchronised sets.'], fr:['Industrie et grands bâtiments','Usines, hôpitaux, résidences et bâtiments publics, y compris groupes synchronisés.']}
 ],
 brands:[
  {name:'Mikano International', logo:'mikano', en:'Generator assembly partner in Cameroon', fr:'Partenaire d’assemblage de groupes au Cameroun'},
  {name:'Greaves Power', logo:'greaves', en:'Gensets and industrial engines', fr:'Groupes et moteurs industriels'},
  {name:'Mahindra', logo:'mahindra', en:'Power generation', fr:'Production d’énergie'},
  {name:'[[Other brands]]', logo:null, en:'[[Brand names to confirm]]', fr:'[[Marques à confirmer]]'}
 ],
 sectors:[
  ['tower','Telecom operators','Prime and standby power for tower sites.','Opérateurs télécoms','Énergie principale et de secours pour les sites pylônes.'],
  ['store','Businesses and industry','Offices, factories, hotels, hospitals and shops.','Entreprises et industrie','Bureaux, usines, hôtels, hôpitaux et commerces.'],
  ['home','Homes','Quiet standby generators for houses and estates.','Particuliers','Groupes de secours silencieux pour maisons et résidences.'],
  ['shield','Government','Public buildings, schools and health centres.','Secteur public','Bâtiments publics, écoles et centres de santé.']
 ],
 after:[
  ['hard','Installation','Delivery, siting, cabling, ATS changeover, commissioning and load test.','Installation','Livraison, implantation, câblage, inverseur ATS, mise en service et essai en charge.'],
  ['wrench','Maintenance contracts','Scheduled servicing, oil and filter changes, and fault call-outs.','Contrats de maintenance','Entretien planifié, vidanges et filtres, et interventions en cas de panne.'],
  ['chip','Spare parts','Genuine filters, belts, batteries and engine parts for the brands we sell.','Pièces détachées','Filtres, courroies, batteries et pièces moteur d’origine pour les marques vendues.'],
  ['clock','Rental','Short-term and long-term hire for events, outages and projects.','Location','Location courte et longue durée pour événements, coupures et chantiers.']
 ],
 sizes:[10,15,20,30,40,60,80,100,150,200,250,300,400,500,650,800,1000,1250,1500,2000],
 slides:[
  {img:'genset-yard', title:'Grato yard', en:'Enclosed generator after coupling and checks', fr:'Groupe capoté après couplage et contrôles', credit:null},
  {img:'mikano-sets', title:'Mikano', en:'Soundproof canopy generators for businesses and institutions', fr:'Groupes insonorisés pour entreprises et institutions',
   credit:{by:'Mikano Nigeria', lic:'CC0', url:'https://commons.wikimedia.org/wiki/File:Mikano_Power_Generating_Set.jpg'}},
  {img:'mikano-compact', title:'Mikano', en:'Compact standby generator for homes and small offices', fr:'Groupe de secours compact pour maisons et petits bureaux',
   credit:{by:'Clement Dike', lic:'CC0', url:'https://commons.wikimedia.org/wiki/File:Mikano_Generator.jpg'}},
  {img:'mikano-standby', title:'Mikano', en:'Standby generator installed at a business', fr:'Groupe de secours installé dans une entreprise',
   credit:{by:'Sardeeq', lic:'CC0', url:'https://commons.wikimedia.org/wiki/File:Engine_mikano.jpg'}},
  {img:'container-genset', title:{en:'Containerised generator', fr:'Groupe en conteneur'}, en:'Large generators for industry, hospitals and estates', fr:'Grands groupes pour l’industrie, les hôpitaux et les résidences',
   credit:{by:'Raysonho', lic:'CC0', url:'https://commons.wikimedia.org/wiki/File:EmergencyPowerGenerator.jpg'}},
  {img:'trailer-genset', title:{en:'Trailer-mounted generator', fr:'Groupe sur remorque'}, en:'Mobile generators for rental, events and projects', fr:'Groupes mobiles pour la location, les événements et les chantiers',
   credit:{by:'Kgbo', lic:'CC BY-SA 4.0', url:'https://commons.wikimedia.org/wiki/File:Large_portable_power_generator_in_Corinda,_Queensland.jpg'}}
 ]
};
export const LOGO = {'IHS Nigeria':'ihs','IHS Cameroon':'ihs','Exicom':'exicom','Mikano International':'mikano','Greaves Power':'greaves','JMG':'jmg','Mahindra':'mahindra','Access Bank':'access','Access Bank Cameroon':'access','MTN':'mtn','Airtel':'airtel','Glo':'glo','9mobile':'ninemobile'};
export const HAS480 = ['solar-tower','genset-yard','lattice-tower','civil-works','tower-shelter','warehouse','mikano-sets','mikano-compact','mikano-standby','container-genset','trailer-genset'];

// ---- Strings added for the React build (live form sending, 404 page) ----
Object.assign(STRINGS.en, {
  sending: 'Sending…',
  sendErr: 'We could not send your request. Check your connection and try again, or email info@gratoengineering.com.',
  doneTextLive: 'Thank you. Your request has reached our team at info@gratoengineering.com and we will reply within [[1 working day]]. Keep this reference for any follow-up.',
  doneTextDemo: 'Form sending is not connected yet, so nothing was sent. Set VITE_FORM_ENDPOINT to deliver requests to your inbox.',
  crDoneTextLive: 'Thank you. Your application has reached our HR team. We will contact you if your profile matches an opening.',
  nfTitle: 'Page not found', nfText: 'The page you are looking for has moved or does not exist.', nfHome: 'Back to the home page',
});
Object.assign(STRINGS.fr, {
  sending: 'Envoi…',
  sendErr: 'Votre demande n’a pas pu être envoyée. Vérifiez votre connexion et réessayez, ou écrivez à info@gratoengineering.com.',
  doneTextLive: 'Merci. Votre demande est parvenue à notre équipe à info@gratoengineering.com ; nous vous répondrons sous [[1 jour ouvré]]. Conservez cette référence pour tout suivi.',
  doneTextDemo: 'L’envoi du formulaire n’est pas encore connecté : rien n’a été envoyé. Renseignez VITE_FORM_ENDPOINT pour recevoir les demandes par e-mail.',
  crDoneTextLive: 'Merci. Votre candidature est parvenue à notre équipe RH. Nous vous contacterons si votre profil correspond à un poste.',
  nfTitle: 'Page introuvable', nfText: 'La page que vous cherchez a été déplacée ou n’existe pas.', nfHome: 'Retour à l’accueil',
});
Object.assign(STRINGS.en, { prevCase: 'Previous project', nextCase: 'Next project' });
Object.assign(STRINGS.fr, { prevCase: 'Projet précédent', nextCase: 'Projet suivant' });
