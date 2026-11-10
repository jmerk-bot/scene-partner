// Unified script library for Scene Partner.
//
// Combines:
//   - Top 20 William Shakespeare plays (excluding the minor histories)
//   - Classic masterworks by Wilde, Chekhov, Ibsen, Sophocles, Euripides,
//     Aeschylus, Aristophanes, Molière, Shaw, Rostand, Marlowe, Jonson,
//     Webster, Behn, Sheridan, Goldsmith, Strindberg, Gogol, Schiller,
//     Goethe, Calderón, Lope de Vega, Synge, Glaspell, and more (120+ total)
//   - Any user-uploaded PDF / text scripts saved in local state

import { SHAKESPEARE_PLAYS } from './library-shakespeare.js';
import { CLASSIC_PLAYS, EXTENDED_CATALOG, hydrateCatalogPlay } from './library-classics.js';

// Additional classic repertoire entries to bring the pre-loaded library past 115 plays
const MORE_REPERTOIRE = [
  { id: 'wilde-vera', title: 'Vera; or, The Nihilists', playwright: 'Oscar Wilde', era: 'Victorian & Edwardian', year: '1880', genre: 'Melodrama', roles: ['VERA', 'ALEXIS', 'CZAREVITCH', 'MICHAEL'], hook: 'Vera swears a revolutionary oath in Tsarist Russia, until she discovers the man she loves is heir to the throne.' },
  { id: 'chekhov-wood-demon', title: 'The Wood Demon', playwright: 'Anton Chekhov', era: 'Russian Masters', year: '1889', genre: 'Comedy / Drama', roles: ['KHRUSHCHOV', 'YELENA', 'SONYA', 'VOINITSKY'], hook: 'A passionate conservationist doctor fights to save the Russian forests and heal fractured country hearts.' },
  { id: 'chekhov-jubilee', title: 'The Anniversary (The Jubilee)', playwright: 'Anton Chekhov', era: 'Russian Masters', year: '1891', genre: 'Farce', roles: ['SHIPUCHIN', 'KHIRIN', 'MERCHUTKINA', 'TATYANA'], hook: 'A bank’s fifteenth-anniversary celebration descends into pandemonium inside the director’s office.' },
  { id: 'ibsen-brand', title: 'Brand', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1866', genre: 'Verse Tragedy', roles: ['BRAND', 'AGNES', 'GERD', 'MAYOR'], hook: 'An uncompromising priest lives by the motto "All or Nothing" amid the icy fjords of Norway.' },
  { id: 'ibsen-pillars-society', title: 'The Pillars of Society', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1877', genre: 'Drama', roles: ['KARSTEN BERNICK', 'LONA HESSEL', 'JOHAN', 'DINA'], hook: 'A respected shipbuilder’s dark secrets return from America aboard a dangerously unseaworthy vessel.' },
  { id: 'ibsen-john-gabriel', title: 'John Gabriel Borkman', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1896', genre: 'Drama', roles: ['BORKMAN', 'GUNHILD', 'ELLA RENTHEIM', 'ERHART'], hook: 'After eight years pacing his upstairs gallery like a caged wolf, a disgraced financier faces twin sisters.' },
  { id: 'ibsen-when-we-dead', title: 'When We Dead Awaken', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1899', genre: 'Dramatic Epilogue', roles: ['RUBEK', 'IRENE', 'MAJA', 'ULFHEIM'], hook: 'An aging sculptor meets his former model high in the mountains and confronts the life he sacrificed for art.' },
  { id: 'sophocles-women-trachis', title: 'Women of Trachis', playwright: 'Sophocles', era: 'Classical Greek', year: '430 BC', genre: 'Greek Tragedy', roles: ['DEIANEIRA', 'HERACLES', 'HYLLUS', 'NURSE'], hook: 'Seeking to win back Heracles’ love with a centaur’s charm, Deianeira triggers an agonizing fate.' },
  { id: 'euripides-hecuba', title: 'Hecuba', playwright: 'Euripides', era: 'Classical Greek', year: '424 BC', genre: 'Greek Tragedy', roles: ['HECUBA', 'POLYXENA', 'AGAMEMNON', 'POLYMESTOR'], hook: 'On the Thracian coast after Troy’s fall, Queen Hecuba exacts terrible justice for her murdered son.' },
  { id: 'euripides-andromache', title: 'Andromache', playwright: 'Euripides', era: 'Classical Greek', year: '425 BC', genre: 'Greek Tragedy', roles: ['ANDROMACHE', 'HERMIONE', 'PELEUS', 'MENELAUS'], hook: 'Hector’s widow fights to protect her child from the jealousy of Hermione and Menelaus.' },
  { id: 'euripides-iphigenia-tauris', title: 'Iphigenia in Tauris', playwright: 'Euripides', era: 'Classical Greek', year: '414 BC', genre: 'Greek Romance', roles: ['IPHIGENIA', 'ORESTES', 'PYLADES', 'THOAS'], hook: 'Whisked away by Artemis to Tauris, priestess Iphigenia must recognize her brother Orestes before sacrificing him.' },
  { id: 'euripides-ion', title: 'Ion', playwright: 'Euripides', era: 'Classical Greek', year: '413 BC', genre: 'Greek Drama', roles: ['ION', 'CREUSA', 'XUTHUS', 'PRIESTESS'], hook: 'At Apollo’s temple in Delphi, a temple youth and an Athenian queen discover they are mother and son.' },
  { id: 'euripides-helen', title: 'Helen', playwright: 'Euripides', era: 'Classical Greek', year: '412 BC', genre: 'Greek Romance', roles: ['HELEN', 'MENELAUS', 'THEONOE', 'THEOCLYMENUS'], hook: 'Shipwrecked in Egypt, Menelaus discovers the real Helen never went to Troy at all.' },
  { id: 'euripides-orestes', title: 'Orestes', playwright: 'Euripides', era: 'Classical Greek', year: '408 BC', genre: 'Greek Tragedy', roles: ['ORESTES', 'ELECTRA', 'PYLADES', 'MENELAUS'], hook: 'Condemned by the citizens of Argos, Orestes and Electra make a desperate stand.' },
  { id: 'aeschylus-persians', title: 'The Persians', playwright: 'Aeschylus', era: 'Classical Greek', year: '472 BC', genre: 'Greek Tragedy', roles: ['ATOSSA', 'XERXES', 'GHOST OF DARIUS', 'MESSENGER'], hook: 'At the Persian court in Susa, Queen Atossa awaits word of King Xerxes’ fateful invasion of Greece.' },
  { id: 'aeschylus-seven-thebes', title: 'Seven Against Thebes', playwright: 'Aeschylus', era: 'Classical Greek', year: '467 BC', genre: 'Greek Tragedy', roles: ['ETEOCLES', 'ANTIGONE', 'ISMENE', 'SCOUT'], hook: 'King Eteocles assigns defenders to the seven gates of Thebes—only to face his own brother at the seventh.' },
  { id: 'aeschylus-suppliants', title: 'The Suppliants', playwright: 'Aeschylus', era: 'Classical Greek', year: '463 BC', genre: 'Greek Tragedy', roles: ['DANAUS', 'PELASGUS', 'CHORUS OF DANAIDS'], hook: 'Fifty daughters of Danaus flee forced marriage in Egypt and claim sanctuary on the shores of Argos.' },
  { id: 'aristophanes-wasps', title: 'The Wasps', playwright: 'Aristophanes', era: 'Classical Greek', year: '422 BC', genre: 'Old Comedy', roles: ['PHILOCLEON', 'BDELYCLEON', 'SOSIAS'], hook: 'A son tries to cure his father’s obsession with serving on Athenian law-court juries by staging a trial at home.' },
  { id: 'aristophanes-peace', title: 'Peace', playwright: 'Aristophanes', era: 'Classical Greek', year: '421 BC', genre: 'Old Comedy', roles: ['TRYGAEUS', 'HERMES', 'WAR'], hook: 'An Athenian vineyard owner flies to Mount Olympus on a giant dung beetle to rescue the goddess Peace.' },
  { id: 'aristophanes-women-thesmophoria', title: 'Thesmophoriazusae', playwright: 'Aristophanes', era: 'Classical Greek', year: '411 BC', genre: 'Old Comedy', roles: ['EURIPIDES', 'MNESILOCHUS', 'AGATHON'], hook: 'Tragedian Euripides sends his relative in disguise to infiltrate a women’s festival plotting his downfall.' },
  { id: 'moliere-don-juan', title: 'Dom Juan', playwright: 'Molière', era: 'French Classics', year: '1665', genre: 'Tragicomedy', roles: ['DOM JUAN', 'SGANARELLE', 'ELVIRE', 'STATUE'], hook: 'The defiant libertine Dom Juan mocks heaven and marriage alongside his long-suffering servant Sganarelle.' },
  { id: 'moliere-doctor-in-spite', title: 'The Doctor in Spite of Himself', playwright: 'Molière', era: 'French Classics', year: '1666', genre: 'Farce', roles: ['SGANARELLE', 'MARTINE', 'LUCINDE', 'GERONTE'], hook: 'Woodcutter Sganarelle is mistaken for a brilliant eccentric physician and called to cure a girl feigning muteness.' },
  { id: 'moliere-amphitryon', title: 'Amphitryon', playwright: 'Molière', era: 'French Classics', year: '1668', genre: 'Mythological Comedy', roles: ['AMPHITRYON', 'ALCMENE', 'SOSIE', 'MERCURY'], hook: 'Jupiter and Mercury disguise themselves as Theban general Amphitryon and his valet Sosie.' },
  { id: 'moliere-scapin', title: 'The Impostures of Scapin', playwright: 'Molière', era: 'French Classics', year: '1671', genre: 'Commedia Farce', roles: ['SCAPIN', 'OCTAVE', 'LEANDRE', 'GERONTE'], hook: 'Clever valet Scapin spins outrageous schemes to rescue two young lovers from their miserly fathers.' },
  { id: 'shaw-devil-disciple', title: 'The Devil’s Disciple', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1897', genre: 'Melodrama / Comedy', roles: ['DICK DUDGEON', 'JUDITH ANDERSON', 'GENERAL BURGOYNE', 'ANTHONY ANDERSON'], hook: 'During the American Revolution, self-proclaimed outcast Dick Dudgeon takes a minister’s place on the gallows.' },
  { id: 'shaw-caesar-cleopatra', title: 'Caesar and Cleopatra', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1898', genre: 'Historical Comedy', roles: ['CAESAR', 'CLEOPATRA', 'FTATATEETA', 'RUFIO'], hook: 'Between the paws of the Sphinx, aging philosopher-general Julius Caesar mentors sixteen-year-old Cleopatra.' },
  { id: 'shaw-philanderer', title: 'The Philanderer', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1893', genre: 'Comedy', roles: ['CHARTERIS', 'GRACE TRANFIELD', 'JULIA CRAVEN'], hook: 'At London’s newly founded Ibsen Club, Leonard Charteris finds himself caught between two very modern women.' },
  { id: 'shaw-you-never-can-tell', title: 'You Never Can Tell', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1897', genre: 'Seaside Comedy', roles: ['GLORIA', 'VALENTINE', 'DOLLY', 'WILLIAM THE WAITER'], hook: 'A "five-shilling dentist" falls for a fiercely rational twentieth-century woman at an English seaside hotel.' },
  { id: 'shaw-doctors-dilemma', title: 'The Doctor’s Dilemma', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1906', genre: 'Problem Play', roles: ['RIDGEON', 'JENNIFER DUBEDAT', 'LOUIS DUBEDAT', 'BMB'], hook: 'With room to save only one patient, Sir Colenso Ridgeon must choose between a humble colleague and a gifted rogue artist.' },
  { id: 'shaw-misalliance', title: 'Misalliance', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1910', genre: 'Debate Comedy', roles: ['HYPATIA', 'LINA SZCZEPANOWSKA', 'TARLETON', 'JOEY'], hook: 'An aeroplane crashes into a Surrey conservatory, bringing a fearless Polish acrobat into a household of restless debaters.' },
  { id: 'shaw-androcles', title: 'Androcles and the Lion', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1912', genre: 'Fable Comedy', roles: ['ANDROCLES', 'LAVINia', 'CAPTAIN', 'FERROVIUS'], hook: 'Gentle tailor Androcles pulls a thorn from a lion’s paw—and meets the beast again in the Roman Colosseum.' },
  { id: 'marlowe-jew-of-malta', title: 'The Jew of Malta', playwright: 'Christopher Marlowe', era: 'Elizabethan & Jacobean', year: '1589', genre: 'Tragedy', roles: ['BARABAS', 'ABIGAIL', 'ITHAMORE', 'FERNEZE'], hook: 'Stripped of his wealth to pay Malta’s tribute to the Turks, merchant Barabas plots elaborate revenge.' },
  { id: 'jonson-bartholomew-fair', title: 'Bartholomew Fair', playwright: 'Ben Jonson', era: 'Elizabethan & Jacobean', year: '1614', genre: 'City Comedy', roles: ['ZEAL-OF-THE-LAND BUSY', 'URSULA', 'WASPE', 'OVERDO'], hook: 'Puritans, cutpurses, puppeteers, and disguised magistrates collide at London’s rowdiest summer fair.' },
  { id: 'jonson-epicoene', title: 'Epicoene, or the Silent Woman', playwright: 'Ben Jonson', era: 'Elizabethan & Jacobean', year: '1609', genre: 'Comedy', roles: ['MOROSE', 'DAUPHINE', 'EPICOENE', 'TRUEWIT'], hook: 'Noise-hating uncle Morose marries a famously silent bride—who finds her voice the instant the knot is tied.' },
  { id: 'kyd-spanish-tragedy', title: 'The Spanish Tragedy', playwright: 'Thomas Kyd', era: 'Elizabethan & Jacobean', year: '1587', genre: 'Revenge Tragedy', roles: ['HIERONIMO', 'BEL-IMPERIA', 'LORENZO', 'BALTHAZAR'], hook: 'Knight Marshal Hieronimo stages a deadly play-within-a-play to avenge his murdered son Horatio.' },
  { id: 'dekker-shoemaker', title: 'The Shoemaker’s Holiday', playwright: 'Thomas Dekker', era: 'Elizabethan & Jacobean', year: '1599', genre: 'Citizen Comedy', roles: ['SIMON EYRE', 'LACY', 'ROSE', 'MARGERY'], hook: 'Jovial master shoemaker Simon Eyre rises to become Lord Mayor of London while aiding disguised lovers.' },
  { id: 'beaumont-knight-burning-pestle', title: 'The Knight of the Burning Pestle', playwright: 'Francis Beaumont', era: 'Elizabethan & Jacobean', year: '1607', genre: 'Metatheatrical Satire', roles: ['RAFE', 'CITIZEN', 'WIFE', 'JASPER'], hook: 'A grocer and his wife climb onto the stage to demand their apprentice Rafe star as a chivalric knight-errant.' },
  { id: 'etherege-man-of-mode', title: 'The Man of Mode', playwright: 'George Etherege', era: 'Restoration & 18th Century', year: '1676', genre: 'Restoration Comedy', roles: ['DORIMANT', 'HARRIET', 'MRS LOVEIT', 'SIR FOPLING FLUTTER'], hook: 'Charming rake Dorimant meets his match in the sharp-witted country heiress Harriet.' },
  { id: 'wycherley-country-wife', title: 'The Country Wife', playwright: 'William Wycherley', era: 'Restoration & 18th Century', year: '1675', genre: 'Restoration Comedy', roles: ['HORNER', 'MARGERY PINCHWIFE', 'PINCHWIFE', 'ALITHEA'], hook: 'Jealous Mr. Pinchwife tries to hide his naive country bride from London’s wits.' },
  { id: 'farquhar-beaux-stratagem', title: 'The Beaux’ Stratagem', playwright: 'George Farquhar', era: 'Restoration & 18th Century', year: '1707', genre: 'Comedy', roles: ['ARCHER', 'AIMWELL', 'DORINDA', 'MRS SULLEN'], hook: 'Two broke gentlemen travel through Lichfield taking turns posing as master and servant to win an heiress.' },
  { id: 'racine-phedre', title: 'Phèdre', playwright: 'Jean Racine', era: 'French Classics', year: '1677', genre: 'Neoclassical Tragedy', roles: ['PHEDRE', 'HIPPOLYTE', 'OENONE', 'THESEE'], hook: 'Believing King Thésée dead, Queen Phèdre confesses her consuming passion for her stepson Hippolyte.' },
  { id: 'corneille-le-cid', title: 'Le Cid', playwright: 'Pierre Corneille', era: 'French Classics', year: '1637', genre: 'Tragicomedy', roles: ['RODRIGUE', 'CHIMENE', 'DON DIEGUE', 'INFANTA'], hook: 'Torn between love and family honor, Rodrigue and Chimène face an impossible moral duel.' },
  { id: 'marivaux-game-love-chance', title: 'The Game of Love and Chance', playwright: 'Pierre de Marivaux', era: 'French Classics', year: '1730', genre: 'Romantic Comedy', roles: ['SILVIA', 'DORANTE', 'ARLEQUIN', 'LISETTE'], hook: 'Betrothed strangers Silvia and Dorante both secretly swap places with their servants to observe each other.' },
  { id: 'beaumarchais-figaro', title: 'The Marriage of Figaro', playwright: 'Pierre Beaumarchais', era: 'French Classics', year: '1784', genre: 'Comedy', roles: ['FIGARO', 'SUZANNE', 'COUNT ALMAVIVA', 'COUNTESS'], hook: 'Resourceful barber Figaro and bride Suzanne outwit Count Almaviva in a whirlwind day of disguises.' },
  { id: 'schiller-robbers', title: 'The Robbers', playwright: 'Friedrich Schiller', era: 'European Classics', year: '1781', genre: 'Sturm und Drang', roles: ['KARL MOOR', 'FRANZ MOOR', 'AMALIA'], hook: 'Disinherited through his scheming brother Franz’s lies, idealistic Karl Moor becomes captain of an outlaw band.' },
  { id: 'lessing-nathan-wise', title: 'Nathan the Wise', playwright: 'Gotthold Ephraim Lessing', era: 'European Classics', year: '1779', genre: 'Dramatic Poem', roles: ['NATHAN', 'SALADIN', 'RECHA', 'TEMPLAR'], hook: 'In Jerusalem during the Third Crusade, Nathan answers Sultan Saladin with the Parable of the Three Rings.' },
  { id: 'kleist-prince-homburg', title: 'The Prince of Homburg', playwright: 'Heinrich von Kleist', era: 'European Classics', year: '1811', genre: 'Romantic Drama', roles: ['PRINCE OF HOMBURG', 'NATALIE', 'ELECTOR', 'KOTTWITZ'], hook: 'A sleepwalking cavalry prince wins a glorious victory by charging before orders—and is sentenced to death for disobedience.' },
  { id: 'buchner-woyzeck', title: 'Woyzeck', playwright: 'Georg Büchner', era: 'European Classics', year: '1837', genre: 'Modern Tragedy', roles: ['WOYZECK', 'MARIE', 'CAPTAIN', 'DOCTOR'], hook: 'A poor soldier subjected to medical experiments struggles to support Marie in a cold, indifferent society.' },
  { id: 'goldoni-servant-two-masters', title: 'The Servant of Two Masters', playwright: 'Carlo Goldoni', era: 'European Classics', year: '1746', genre: 'Commedia dell’Arte', roles: ['TRUFFALDINO', 'BEATRICE', 'FLORINDO', 'SMERALDINA'], hook: 'Hungry harlequin Truffaldino signs on with two masters at once—not realizing they are disguised lovers searching for each other.' }
];

// Normalize a play object so `.characters` and `.characterLineCounts` are always populated
export function enrichPlay(rawPlay) {
  const play = hydrateCatalogPlay(rawPlay);
  const counts = Object.create(null);
  for (const scene of play.scenes || []) {
    for (const line of scene.lines || []) {
      const sp = String(line.speaker || '').trim();
      if (sp && sp !== '__proto__' && sp !== 'constructor' && sp !== 'prototype') {
        counts[sp] = (counts[sp] || 0) + 1;
      }
    }
  }
  const characters = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const plainCounts = { ...counts };
  return {
    ...play,
    characters,
    characterLineCounts: plainCounts,
    totalLines: Object.values(plainCounts).reduce((a, b) => a + b, 0)
  };
}

const BUILTIN_PLAYS = [
  ...SHAKESPEARE_PLAYS,
  ...CLASSIC_PLAYS,
  ...EXTENDED_CATALOG,
  ...MORE_REPERTOIRE
].map(enrichPlay);

export function getAllPlays(customPlays = []) {
  const customEnriched = (customPlays || []).map(enrichPlay);
  return [...customEnriched, ...BUILTIN_PLAYS];
}

export function getPlayById(playId, customPlays = []) {
  const all = getAllPlays(customPlays);
  return all.find((p) => p.id === playId) || all[0];
}

// Group plays by Playwright, placing William Shakespeare and Uploaded Scripts prominently
export function groupPlaysByPlaywright(plays) {
  const groups = new Map();
  for (const p of plays) {
    const key = p.custom ? 'Uploaded Scripts (PDF / Sides)' : (p.playwright || 'Classic Playwrights');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  return Array.from(groups.entries()).map(([playwright, list]) => ({
    playwright,
    era: list[0]?.era || (list[0]?.custom ? 'Custom' : 'Classical'),
    plays: list
  }));
}
