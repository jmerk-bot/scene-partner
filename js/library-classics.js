// World Classics Library for Scene Partner (organized by Playwright).
// Includes Oscar Wilde, Anton Chekhov, Henrik Ibsen, Sophocles, Euripides,
// Aeschylus, Aristophanes, Molière, George Bernard Shaw, Christopher Marlowe,
// Ben Jonson, John Webster, Aphra Behn, Richard Brinsley Sheridan, Oliver Goldsmith,
// Edmond Rostand, August Strindberg, Nikolai Gogol, Friedrich Schiller,
// Johann Wolfgang von Goethe, Pedro Calderón de la Barca, Lope de Vega,
// Susan Glaspell, and J.M. Synge — plus an on-demand scene builder so every
// single play in the 120+ catalog is immediately playable offline or online.

export const CLASSIC_PLAYS = [
  // ---------- Oscar Wilde ----------
  {
    id: 'wilde-earnest',
    title: 'The Importance of Being Earnest',
    playwright: 'Oscar Wilde',
    era: 'Victorian & Edwardian',
    year: '1895',
    genre: 'Comedy of Manners',
    summary: 'Jack Worthing and Algernon Moncrieff invent alter egos named "Ernest" to court Gwendolen and Cecily under Lady Bracknell’s formidable gaze.',
    scenes: [
      {
        id: 'act1-sc1',
        title: 'Act I — Jack, Algernon & Lady Bracknell ("A handbag?!")',
        lines: [
          { speaker: 'ALGERNON', text: 'Did you hear what I was playing, Lane? I didn’t think it polite to listen, sir. Well, I’m sorry for that, for your sake. I don’t play accurately—any one can play accurately—but I play with wonderful expression. Ah! Haloo, Ernest, what brings you up to town?' },
          { speaker: 'JACK', text: 'Oh, pleasure, pleasure! What else should bring one anywhere? Eating as usual, I see, Algy!' },
          { speaker: 'ALGERNON', text: 'I believe it is customary in good society to take some slight refreshment at five o’clock. Where have you been since last Thursday?' },
          { speaker: 'JACK', text: 'In the country. And I have come up to town expressly to propose to Gwendolen.' },
          { speaker: 'ALGERNON', text: 'I thought you had come up for pleasure? I call that business. Besides, before I allow you to marry Gwendolen, you will have to clear up the whole question of Cecily.' },
          { speaker: 'JACK', text: 'My dear fellow, there is nothing whatever to clear up. My name is Ernest in town and Jack in the country.' },
          { speaker: 'GWENDOLEN', direction: 'Entering', text: 'Ernest! My own Ernest! You have always inspired me with an absolute confidence. For me you have always had an irresistible fascination. Even before I met you I was far from indifferent to you. We live, as I hope you know, Mr. Worthing, in an age of ideals, and my ideal has always been to love some one of the name of Ernest.' },
          { speaker: 'JACK', text: 'But, Gwendolen, do you really mean to say that you couldn’t love me if my name wasn’t Ernest? Suppose it were Jack?' },
          { speaker: 'GWENDOLEN', text: 'Jack? No, there is very little music in the name Jack, if any at all, indeed. The only really safe name is Ernest.' },
          { speaker: 'LADY BRACKNELL', direction: 'Entering', text: 'Gwendolen, what does this mean?' },
          { speaker: 'GWENDOLEN', text: 'Merely that I am engaged to be married to Mr. Worthing, mamma.' },
          { speaker: 'LADY BRACKNELL', text: 'Pardon me, you are not engaged to any one. When you do become engaged to some one, I, or your father, will inform you of the fact. Mr. Worthing, I will trouble you to answer a few questions. Are your parents living?' },
          { speaker: 'JACK', text: 'I have lost both my parents.' },
          { speaker: 'LADY BRACKNELL', text: 'To lose one parent, Mr. Worthing, may be regarded as a misfortune; to lose both looks like carelessness. Who was your father?' },
          { speaker: 'JACK', text: 'I am afraid I really don’t know. I was found by the late Mr. Thomas Cardew in a handbag.' },
          { speaker: 'LADY BRACKNELL', text: 'A handbag?!' },
          { speaker: 'JACK', text: 'Yes, Lady Bracknell. I was in a somewhat large, black leather handbag, with handles to it—an ordinary handbag in fact, in the cloak-room at Victoria Station.' },
          { speaker: 'LADY BRACKNELL', text: 'The cloak-room at Victoria Station? To be born, or at any rate bred, in a handbag, whether it had handles or not, seems to me to display a contempt for the ordinary decencies of family life! You can hardly imagine that I and Lord Bracknell would dream of allowing our only daughter to marry into a cloak-room, and form an alliance with a parcel!' }
        ]
      },
      {
        id: 'act2-sc1',
        title: 'Act II — Gwendolen & Cecily at Tea ("Muffins and Tea-Cake")',
        lines: [
          { speaker: 'CECILY', text: 'Pray let me introduce myself to you. My name is Cecily Cardew.' },
          { speaker: 'GWENDOLEN', text: 'Cecily Cardew? What a very sweet name! Something tells me that we are going to be great friends. I like you already more than I can say.' },
          { speaker: 'CECILY', text: 'Of course I am not on any visit here at all. I live here. Mr. Worthing is my guardian.' },
          { speaker: 'GWENDOLEN', text: 'Oh! It is strange he never mentioned to me that he had a ward. For I am engaged to Mr. Ernest Worthing.' },
          { speaker: 'CECILY', text: 'I beg your pardon, Gwendolen, there is some slight error. Mr. Ernest Worthing is engaged to me. The announcement will appear in the Morning Post on Saturday.' },
          { speaker: 'GWENDOLEN', text: 'I feel bound to point out that since Ernest proposed to me yesterday afternoon, he has clearly changed his mind.' },
          { speaker: 'CECILY', text: 'Wait until we offer tea. May I offer you some tea, Miss Fairfax?' },
          { speaker: 'GWENDOLEN', text: 'Thank you. Detestable girl! But I require tea! Sugar?' },
          { speaker: 'CECILY', text: 'No, thank you. Sugar is not fashionable any more. Cake or bread and butter?' },
          { speaker: 'GWENDOLEN', text: 'Bread and butter, please. Cake is rarely seen at the best houses nowadays.' },
          { speaker: 'CECILY', text: 'Cut some tea-cake, Merriman, and put four lumps of sugar in Miss Fairfax’s tea.' },
          { speaker: 'GWENDOLEN', text: 'You have filled my tea with lumps of sugar, and though I asked most distinctly for bread and butter, you have given me cake. I am known for the gentleness of my disposition, and the extraordinary sweetness of my nature, but I warn you, Miss Cardew, you may go too far.' },
          { speaker: 'CECILY', text: 'To save my poor, innocent, trusting boy from the machinations of any other girl there are no lengths to which I would not go!' }
        ]
      }
    ]
  },
  {
    id: 'wilde-ideal-husband',
    title: 'An Ideal Husband',
    playwright: 'Oscar Wilde',
    era: 'Victorian & Edwardian',
    year: '1895',
    genre: 'Comedy / Drama',
    summary: 'Sir Robert Chiltern’s spotless political career is threatened by the blackmailing Mrs. Cheveley, forcing Lord Goring to intervene.',
    scenes: [
      {
        id: 'act1-sc1',
        title: 'Act I — Mrs. Cheveley Blackmails Sir Robert Chiltern',
        lines: [
          { speaker: 'MRS CHEVELEY', text: 'Sir Robert, I want to talk to you about a great political and financial scheme, regarding this Argentine Canal Company.' },
          { speaker: 'SIR ROBERT', text: 'Believe me, Mrs. Cheveley, it is a commonplace stock-exchange swindle. Wait—I must denounce it in the House tomorrow night.' },
          { speaker: 'MRS CHEVELEY', text: 'You must not, Sir Robert. If you will lay your speech aside, I will give you back the letter you wrote to Baron Arnheim when you were Under-Secretary—the letter selling him a Cabinet secret.' },
          { speaker: 'SIR ROBERT', text: 'Stop! You want me to withdraw my report in exchange for that letter?' },
          { speaker: 'MRS CHEVELEY', text: 'Precisely. Nowadays, with our modern mania for morality, everyone has to pose as a paragon of purity, incorruptibility, and all the other seven deadly virtues—and what is the result? You all go over like ninepins!' },
          { speaker: 'SIR ROBERT', text: 'It is an infamous bargain! My wife believes me free from every stain.' },
          { speaker: 'MRS CHEVELEY', text: 'Then do not disillusion her. A woman’s love is easily shattered when her idol falls.' }
        ]
      }
    ]
  },
  {
    id: 'wilde-windermere',
    title: 'Lady Windermere’s Fan',
    playwright: 'Oscar Wilde',
    era: 'Victorian & Edwardian',
    year: '1892',
    genre: 'Comedy of Manners',
    summary: 'Suspecting her husband of infidelity with the mysterious Mrs. Erlynne, Lady Windermere risks scandal until a secret sacrifice saves her.',
    scenes: [
      {
        id: 'act3-sc1',
        title: 'Act III — Lord Darlington’s Rooms ("We are all in the gutter")',
        lines: [
          { speaker: 'LADY WINDERMERE', text: 'Why doesn’t Lord Darlington come? Have I done right? Never to see my child again! No—I will go back!' },
          { speaker: 'MRS ERLYNNE', text: 'Lady Windermere! Thank Heaven I am in time. You must go back to your husband’s house immediately.' },
          { speaker: 'LADY WINDERMERE', text: 'No! You are the woman who has taken my husband from me! Why do you come here?' },
          { speaker: 'MRS ERLYNNE', text: 'Because I know what awaits a woman who leaves her home. You don’t know what it is to fall into the pit, to be despised, mocked, abandoned, sneered at—to be an outcast!' },
          { speaker: 'LADY WINDERMERE', text: 'Take me home. Take me home!' },
          { speaker: 'LORD DARLINGTON', direction: 'Entering with Cecil Graham', text: 'What a night! Do you think women are worse than men, Dumby?' },
          { speaker: 'LORD AUGUSTUS', text: 'You are all very cynical.' },
          { speaker: 'LORD DARLINGTON', text: 'No, we are all in the gutter, but some of us are looking at the stars.' }
        ]
      }
    ]
  },

  // ---------- Anton Chekhov ----------
  {
    id: 'chekhov-seagull',
    title: 'The Seagull',
    playwright: 'Anton Chekhov',
    era: 'Russian Masters',
    year: '1896',
    genre: 'Drama',
    summary: 'On a country estate by a lake, young playwright Konstantin Treplev, aspiring actress Nina, famed actress Arkadina, and writer Trigorin wrestle with art and unrequited love.',
    scenes: [
      {
        id: 'act1-sc1',
        title: 'Act I — Masha & Medvedenko; Konstantin & Nina by the Lake',
        lines: [
          { speaker: 'MEDVEDENKO', text: 'Why do you always wear black?' },
          { speaker: 'MASHA', text: 'I am in mourning for my life. I am unhappy.' },
          { speaker: 'MEDVEDENKO', text: 'Why? I don’t understand. You are in good health; your father is not rich, but he is well off. My life is much harder than yours.' },
          { speaker: 'MASHA', text: 'It isn’t a question of money. Even a beggar can be happy.' },
          { speaker: 'TREPLEV', direction: 'Entering', text: 'The stage is ready. In ten minutes the curtain goes up, and Nina is not here yet. My mother despises my play before she has even heard a line of it. She wants only routine theatre—while we need new forms! New forms we must have, and if we can’t get them, we had better have nothing at all.' },
          { speaker: 'NINA', direction: 'Entering breathlessly', text: 'I am not late, am I? Surely I am not late!' },
          { speaker: 'TREPLEV', text: 'No, no, Nina, my darling!' },
          { speaker: 'NINA', text: 'I was so uneasy all day, I was so terrified! I was afraid my father wouldn’t let me come. My heart is beating so! I am afraid of acting before your mother, and before Trigorin—a famous writer! Are there many lofty speeches in my part?' },
          { speaker: 'TREPLEV', text: 'There is little action, it is only a recitation; and there is nothing about love in it.' },
          { speaker: 'NINA', text: 'Men, lions, eagles, and partridges, horned deer, geese, spiders, silent fish that dwell in the water, starfishes, and creatures which cannot be seen by the eye—all living things, all living things, having completed their cycle of sorrow, are extinct.' }
        ]
      },
      {
        id: 'act4-sc1',
        title: 'Act IV — Nina & Konstantin’s Final Reunion ("I am a seagull")',
        lines: [
          { speaker: 'NINA', text: 'Why do you say that you kissed the ground I walked on? You ought to kill me. I am so tired! If I could rest—rest! I am a seagull. No, that’s not it. I am an actress. Well, no matter!' },
          { speaker: 'TREPLEV', text: 'Nina, you cried before, and now again. Stay here, I’ll give you some water.' },
          { speaker: 'NINA', text: 'So now I know, I understand, Kostya, that in our work—in acting or in writing—what matters is not fame, not glory, not what I used to dream about, it’s knowing how to endure. To bear one’s cross and have faith. I have faith and it all doesn’t hurt so much, and when I think of my vocation I am not afraid of life.' },
          { speaker: 'TREPLEV', text: 'You have found your way, you know where you are going, while I am still drifting in a chaos of dreams and images, not knowing what use it is to anyone. Stay, Nina, I entreat you!' }
        ]
      }
    ]
  },
  {
    id: 'chekhov-uncle-vanya',
    title: 'Uncle Vanya',
    playwright: 'Anton Chekhov',
    era: 'Russian Masters',
    year: '1899',
    genre: 'Tragicomedy',
    summary: 'Years of quiet sacrifice on a country estate erupt when a pompous retired professor arrives with his captivating young wife Elena.',
    scenes: [
      {
        id: 'act2-sc1',
        title: 'Act II — Vanya, Elena & Sonya ("We shall rest")',
        lines: [
          { speaker: 'VANYA', text: 'My life is over! I am forty-seven. If I live to be sixty, I have thirteen years more. It’s a long time! How am I to get through those thirteen years? Oh, how I have been deceived! For years I worshipped that old professor, worked like an ox for him!' },
          { speaker: 'ELENA', text: 'Ivan Petrovitch, you are an educated, intelligent man, and I should think you would understand that the world is being destroyed not by crime and fire, but by hatred, enmity, and all this petty squabbling.' },
          { speaker: 'VANYA', text: 'Make peace between me and my own self! My darling—how wonderful you are!' },
          { speaker: 'ELENA', text: 'Let me alone! Go away!' },
          { speaker: 'SONYA', text: 'What can we do? We must live our lives! Yes, we shall live, Uncle Vanya. We shall live through a long, long chain of days and weary evenings; we shall patiently bear the trials which fate imposes on us; we shall work for others both now and when we are old, without ever knowing rest; and when our time comes we shall die submissively, and there beyond the grave we shall say that we have suffered and wept, that our life was bitter, and God will have pity on us. We shall rest! We shall hear the angels, we shall see all heaven lit with diamonds—we shall rest!' }
        ]
      }
    ]
  },
  {
    id: 'chekhov-cherry-orchard',
    title: 'The Cherry Orchard',
    playwright: 'Anton Chekhov',
    era: 'Russian Masters',
    year: '1904',
    genre: 'Tragicomedy',
    summary: 'Madame Ranevskaya returns to her aristocratic family estate just as its beloved cherry orchard is set to be auctioned to pay debts.',
    scenes: [
      {
        id: 'act3-sc1',
        title: 'Act III — Lopakhin Announces the Sale of the Orchard',
        lines: [
          { speaker: 'RANEVSKAYA', text: 'Why is Leonid so long? What has he been doing in town for all this time? Either the estate is sold, or the auction hasn’t taken place. Why keep us in suspense so long?' },
          { speaker: 'LOPAKHIN', direction: 'Entering', text: 'The auction is over. I wanted to get here sooner, and my head’s spinning.' },
          { speaker: 'RANEVSKAYA', text: 'Speak, Yermolai Alexeyitch! Who bought the cherry orchard?' },
          { speaker: 'LOPAKHIN', text: 'I bought it.' },
          { speaker: 'RANEVSKAYA', text: 'You? Oh, my orchard—my sweet, beautiful orchard!' },
          { speaker: 'LOPAKHIN', text: 'I bought it! Wait a bit, ladies and gentlemen, pray, my head’s going round, I can’t speak! Tell me that I’m drunk, that I’m out of my mind, that it’s all a dream! I have bought the estate where my father and grandfather were serfs, where they weren’t even admitted into the kitchen! Come, all of you, and look how Yermolai Lopakhin will take the axe to the cherry orchard!' },
          { speaker: 'ANYA', text: 'Mamma! Don’t cry, my sweet, good, darling mamma! Come with me, darling, come away from here! We will plant a new orchard, finer than this one!' }
        ]
      }
    ]
  },
  {
    id: 'chekhov-three-sisters',
    title: 'Three Sisters',
    playwright: 'Anton Chekhov',
    era: 'Russian Masters',
    year: '1901',
    genre: 'Drama',
    summary: 'Olga, Masha, and Irina yearn to return from their provincial garrison town to the Moscow of their childhood.',
    scenes: [
      {
        id: 'act1-sc1',
        title: 'Act I — Olga, Irina & Masha ("To Moscow! To Moscow!")',
        lines: [
          { speaker: 'OLGA', text: 'Father died just a year ago, on this very day—the fifth of May, your name-day, Irina. It was very cold, then, and snowing. I felt then as though I should never survive it; you lay fainting as though you were dead. And now a year has passed and we can think of it calmly; you are already in a white dress, your face is radiant.' },
          { speaker: 'IRINA', text: 'Why keep recalling memories! Tell me why it is I am so happy today? Just as if I were sailing with the wide blue sky above me and big white birds flying around me. When I woke up this morning, I suddenly felt full of joy and longed so passionately for home—to go back to Moscow!' },
          { speaker: 'OLGA', text: 'Everything is good in this town, except that it’s too provincial. Only one dream keeps growing stronger and stronger—to go to Moscow!' },
          { speaker: 'MASHA', text: 'By the curved sea-shore a green oak stands, a chain of gold upon the oak. I’m going home today; it’s dreary here.' },
          { speaker: 'IRINA', text: 'To Moscow! Sell the house, make an end of everything here, and off to Moscow!' }
        ]
      }
    ]
  },

  // ---------- Henrik Ibsen ----------
  {
    id: 'ibsen-dolls-house',
    title: 'A Doll’s House',
    playwright: 'Henrik Ibsen',
    era: 'Modern Realism',
    year: '1879',
    genre: 'Drama',
    summary: 'Nora Helmer’s secret forgery to save her husband Torvald’s life unravels the illusion of their marriage, leading to the famous door-slam Heard Round the World.',
    scenes: [
      {
        id: 'act3-sc1',
        title: 'Act III — Nora & Torvald’s Final Reckoning ("I must stand quite alone")',
        lines: [
          { speaker: 'TORVALD', text: 'Nora—what does this mean? This icy, stiff expression? Never mind—I have forgiven you everything, Nora; I swear it to you! You loved me as a wife ought to love her husband. Only you had not sufficient knowledge to judge of the means you used. Do you think you are any the less dear to me, because you don’t understand how to act on your own responsibility?' },
          { speaker: 'NORA', text: 'Thank you for your forgiveness. Sit down, Torvald; you and I have much to say to one another.' },
          { speaker: 'TORVALD', text: 'Nora—what is this? Why are you dressed in your everyday clothes at this hour?' },
          { speaker: 'NORA', text: 'Sit down. It will take some time. We have been married now eight years. Does it not occur to you that this is the first time we two, you and I, husband and wife, have had a serious conversation?' },
          { speaker: 'TORVALD', text: 'What do you mean by serious?' },
          { speaker: 'NORA', text: 'In all these eight years—longer than that—from the very beginning of our acquaintance, we have never exchanged a word on any serious subject. I have been greatly wronged, Torvald—first by papa and then by you.' },
          { speaker: 'TORVALD', text: 'What! By us two—by us two, who have loved you better than anyone else in the world?' },
          { speaker: 'NORA', text: 'You have never loved me. You have only thought it pleasant to be in love with me. At home, papa called me his doll-child, and he played with me just as I used to play with my dolls. And when I came to live with you, I was simply transferred from papa’s hands into yours. I have been your doll-wife, just as at home I was papa’s doll-child; and here the children have been my dolls.' },
          { speaker: 'TORVALD', text: 'There is some truth in what you say—exaggerated and strained as your view of it is. But from now on it shall be different. Playtime shall be over, and lesson-time shall begin.' },
          { speaker: 'NORA', text: 'Whose lessons? Mine, or the children’s?' },
          { speaker: 'TORVALD', text: 'Both yours and the children’s, my darling Nora.' },
          { speaker: 'NORA', text: 'Alas, Torvald, you are not the man to educate me into being a proper wife for you. I must stand quite alone, if I am to understand myself and everything about me. It is for that reason that I cannot remain with you any longer. I am going away from here now, at once.' },
          { speaker: 'TORVALD', text: 'You are out of your mind! Before all else, you are a wife and a mother.' },
          { speaker: 'NORA', text: 'I don’t believe that any longer. I believe that before all else I am a reasonable human being, just as you are—or, at all events, that I must try and become one. Goodbye, Torvald.' }
        ]
      }
    ]
  },
  {
    id: 'ibsen-hedda-gabler',
    title: 'Hedda Gabler',
    playwright: 'Henrik Ibsen',
    era: 'Modern Realism',
    year: '1891',
    genre: 'Drama',
    summary: 'Newly married to the pedantic scholar Jørgen Tesman, General Gabler’s restless daughter Hedda manipulates those around her with fatal consequences.',
    scenes: [
      {
        id: 'act2-sc1',
        title: 'Act II — Hedda, Judge Brack & Ejlert Løvborg ("Vine-leaves in his hair")',
        lines: [
          { speaker: 'HEDDA', direction: 'Aiming her father’s pistol into the garden', text: 'Now I am going to shoot you, Judge Brack!' },
          { speaker: 'BRACK', text: 'No, no, no! Don’t stand aiming at me like that! Why on earth are you always playing with those pistols?' },
          { speaker: 'HEDDA', text: 'What in heaven’s name would you have me do with myself? I have bored myself to death on our six-month wedding journey! Everlasting specialist talk about the domestic industries of Brabant during the Middle Ages!' },
          { speaker: 'BRACK', text: 'And yet you married good Jørgen Tesman.' },
          { speaker: 'HEDDA', text: 'I had positively danced myself tired, my dear Judge. My day was done. Wait—here comes Ejlert Løvborg.' },
          { speaker: 'LOVBORG', text: 'Hedda—Gabler! How could you throw yourself away like that? Did there not seem to be a comradeship between us—an absolute frankness?' },
          { speaker: 'HEDDA', text: 'Yes, when we used to sit on the sofa under my father’s portrait, pretending to look at an illustrated paper while you confessed your wild nights. I wanted to have a glimpse into a world which a young girl is not supposed to know anything about. For once in my life I want to have power to mould a human destiny! Go to the party tonight, Ejlert—and come back at ten o’clock with vine-leaves in your hair, heated and bold!' }
        ]
      }
    ]
  },

  // ---------- Ancient Greek Drama (Sophocles, Euripides, Aeschylus, Aristophanes) ----------
  {
    id: 'sophocles-antigone',
    title: 'Antigone',
    playwright: 'Sophocles',
    era: 'Classical Greek',
    year: '441 BC',
    genre: 'Greek Tragedy',
    summary: 'Antigone defies King Creon’s royal edict to bury her fallen brother Polynices, pitting divine conscience against state law.',
    scenes: [
      {
        id: 'sc-creon-antigone',
        title: 'Episode II — Antigone Confronts King Creon',
        lines: [
          { speaker: 'CREON', text: 'Speak, girl, with head bent low and eyes upon the ground: dost thou confess or deny the deed of burying Polynices?' },
          { speaker: 'ANTIGONE', text: 'I confess the deed, and do not deny it at all.' },
          { speaker: 'CREON', text: 'Now tell me thou—not in many words, but briefly—knewest thou that an edict had forbidden this?' },
          { speaker: 'ANTIGONE', text: 'I knew it: how could I help it? It was public.' },
          { speaker: 'CREON', text: 'And thou didst indeed dare to transgress that law?' },
          { speaker: 'ANTIGONE', text: 'Yes; for it was not Zeus that had published me that edict; nor deemed I that thy decrees were of such force, that a mortal could override the unwritten and unfailing statutes of heaven. For their life is not of today or yesterday, but from all time, and no man knows when they were first put forth. Die I must, I knew that well without thy proclamations; and if I am to die before my time, I count that a gain.' },
          { speaker: 'CREON', text: 'Know well that over-stubborn spirits are most often humbled; ’tis the stiffest iron, baked to hardness in the fire, that thou shalt most often see snapped and shivered.' },
          { speaker: 'ANTIGONE', text: 'What wouldst thou more than take my life, now that thou hast caught me?' },
          { speaker: 'CREON', text: 'No more, indeed; having that, I have all. A foe is never a friend—not even in death.' },
          { speaker: 'ANTIGONE', text: '’Tis not my nature to join in hating, but in loving.' }
        ]
      }
    ]
  },
  {
    id: 'sophocles-oedipus',
    title: 'Oedipus Rex (Oedipus the King)',
    playwright: 'Sophocles',
    era: 'Classical Greek',
    year: '429 BC',
    genre: 'Greek Tragedy',
    summary: 'Seeking to lift the plague from Thebes by finding King Laius’s murderer, Oedipus uncovers the devastating truth of his own identity.',
    scenes: [
      {
        id: 'sc-oedipus-tiresias',
        title: 'Episode I — Oedipus & the Blind Prophet Tiresias',
        lines: [
          { speaker: 'OEDIPUS', text: 'Tiresias, whose soul grasps all things, the lore that may be told and the unspeakable, the secrets of heaven and the low things of earth—Thebes is in the grip of plague, and in thee alone, great seer, we find our protector and saviour. Declare who slew King Laius!' },
          { speaker: 'TIRESIAS', text: 'Alas, how dreadful to have wisdom where it profits not the wise! Aye, I knew this well, but let it slip out of mind; else would I never have come hither. Let me go home; most easily wilt thou bear thine own burden to the end, and I mine, if thou wilt consent.' },
          { speaker: 'OEDIPUS', text: 'Thy words are strange, nor kindly to this state which nurtured thee, when thou withholdest this response.' },
          { speaker: 'TIRESIAS', text: 'I will speak no further; rage, then, if thou wilt, with the fiercest wrath thy heart doth know.' },
          { speaker: 'OEDIPUS', text: 'Aye, verily, I will not spare—so wroth I am—to speak all my thought. Know that thou seemest to me e’en to have helped in plotting the deed!' },
          { speaker: 'TIRESIAS', text: 'Is it so? I charge thee that thou abide by the decree of thine own mouth: for thou art the accursed defiler of this land!' },
          { speaker: 'OEDIPUS', text: 'So shameless is this speech thou hast started up! Thinkest thou to escape?' },
          { speaker: 'TIRESIAS', text: 'I have escaped: in my truth is my strength. I say that thou art the slayer of the man whose slayer thou seekest. Thou hast sight, yet seest not in what misery thou art.' }
        ]
      }
    ]
  },
  {
    id: 'euripides-medea',
    title: 'Medea',
    playwright: 'Euripides',
    era: 'Classical Greek',
    year: '431 BC',
    genre: 'Greek Tragedy',
    summary: 'Abandoned in Corinth by Jason for a royal princess, the sorceress Medea confronts betrayal with terrifying resolve.',
    scenes: [
      {
        id: 'sc-medea-jason',
        title: 'Episode II — Medea & Jason’s Confrontation',
        lines: [
          { speaker: 'JASON', text: 'Not now for the first time, but oft before, have I observed what an intractable plague a harsh temper is. Thou mightest have stayed in this land and house, lightly bearing the designs of your superiors, yet because of idle words thou wilt be banished.' },
          { speaker: 'MEDEA', text: 'O vilest of knaves! For that is the worst reproach my tongue can utter against thy lack of manhood! Thou hast come to me, thou, my worst foe! It is not courage or daring to wrong thy friends and then look them in the face, no, it is the worst of all human diseases—shamelessness!' },
          { speaker: 'MEDEA', text: 'I saved thee, as all the Greeks know who embarked with thee aboard the Argo, when thou wast sent to tame the fire-breathing bulls and yoke them, and to sow the deadly tilth; and the dragon which guarded the Golden Fleece, I slew for thee! And after receiving such benefits from me, O basest of men, thou hast betrayed me and taken a new bride!' },
          { speaker: 'JASON', text: 'Wait! In uniting myself to the king’s daughter I acted in our best interests—first for thee, and next for my children.' },
          { speaker: 'MEDEA', text: 'May no prosperous life be mine that brings pain with it, nor wealth that ever stings my heart!' }
        ]
      }
    ]
  },

  // ---------- George Bernard Shaw ----------
  {
    id: 'shaw-pygmalion',
    title: 'Pygmalion',
    playwright: 'George Bernard Shaw',
    era: 'Victorian & Edwardian',
    year: '1913',
    genre: 'Comedy / Satire',
    summary: 'Phonetics professor Henry Higgins bets Colonel Pickering he can pass off Covent Garden flower girl Eliza Doolittle as a duchess.',
    scenes: [
      {
        id: 'act2-sc1',
        title: 'Act II — Wimpole Street: Eliza Demands Lessons from Higgins',
        lines: [
          { speaker: 'ELIZA', text: 'Good morning, sir. I’ve come to have lessons, I am. And to pay for ’em too: make no mistake.' },
          { speaker: 'HIGGINS', text: 'Well, you are a specimen! What do you mean by coming here and asking me to teach you?' },
          { speaker: 'ELIZA', text: 'Well, if you was a gentleman, you might ask me to sit down, I think. Don’t I tell you I’m bringing you business? I want to be a lady in a flower shop stead of selling at the corner of Tottenham Court Road. But they won’t take me unless I can talk more genteel. He said he could teach me. Well, here I am ready to pay him—not asking any favor—and he treats me as if I was dirt.' },
          { speaker: 'PICKERING', text: 'How much do you propose to pay him, Miss Doolittle?' },
          { speaker: 'ELIZA', text: 'Wait—a friend of mine gets French lessons for eighteenpence an hour from a real French gentleman. Well, you wouldn’t have the face to ask me the same for teaching me my own language as you would for French; so I won’t give more than a shilling. Take it or leave it.' },
          { speaker: 'HIGGINS', text: 'You know, Pickering, if you consider a shilling, not as a simple shilling, but as a percentage of this girl’s income, it works out as fully equivalent to sixty or seventy guineas from a millionaire. By George, it’s the biggest offer I ever had!' },
          { speaker: 'PICKERING', text: 'Higgins: I’m interested. What about the ambassador’s garden party? I’ll say you’re the greatest teacher alive if you make that good. I’ll bet you all the expenses of the experiment you can’t do it.' },
          { speaker: 'HIGGINS', text: 'It’s almost irresistible. She’s so deliciously low—so horribly dirty—' },
          { speaker: 'ELIZA', text: 'Ah-ah-ah-ow-ow-oo! I ain’t dirty: I washed my face and hands afore I come, I did!' }
        ]
      }
    ]
  },

  // ---------- Edmond Rostand & Molière ----------
  {
    id: 'rostand-cyrano',
    title: 'Cyrano de Bergerac',
    playwright: 'Edmond Rostand',
    era: 'French Classics',
    year: '1897',
    genre: 'Romantic Drama',
    summary: 'The brilliant swordsman and poet Cyrano, self-conscious of his prominent nose, lends his eloquent words to handsome Christian to woo Roxane.',
    scenes: [
      {
        id: 'act3-sc7',
        title: 'Act III — Beneath Roxane’s Balcony ("A kiss, when all is said, what is it?")',
        lines: [
          { speaker: 'ROXANE', text: 'Is it you, Christian? I am listening. Speak to me of love in the dark.' },
          { speaker: 'CHRISTIAN', direction: 'Whispering to Cyrano', text: 'Prompt me! I don’t know what to say!' },
          { speaker: 'CYRANO', direction: 'Stepping into the shadow beneath the balcony', text: 'Then let me speak for you! Roxane—in the dark my words grope blindly toward your ear. Yes, I trembled before your beauty, so now I speak at last from the shelter of the night!' },
          { speaker: 'ROXANE', text: 'Indeed, your voice is changed tonight—deeper, more vibrant!' },
          { speaker: 'CYRANO', text: 'Because tonight I dare to be myself at last! Where was I? I know not! All I know is that my heart has been silent too long, and now every star in heaven pours down into a single word: I love you!' },
          { speaker: 'ROXANE', text: 'Never have you spoken to me like this!' },
          { speaker: 'CYRANO', text: 'And a kiss—when all is said, what is it? An oath taken closer at hand, a promise more precise, a confession that seeks confirmation, a rose-colored dot placed upon the letter i in loving; a secret whispered to the mouth instead of the ear, a moment of infinity that makes a sound like the humming of bees!' },
          { speaker: 'ROXANE', text: 'Say no more! Climb up and claim it!' }
        ]
      }
    ]
  },
  {
    id: 'moliere-tartuffe',
    title: 'Tartuffe',
    playwright: 'Molière',
    era: 'French Classics',
    year: '1664',
    genre: 'Satirical Comedy',
    summary: 'The wealthy bourgeois Orgon falls under the spell of the pious fraud Tartuffe, until Elmire and Dorine set a trap to expose his hypocrisy.',
    scenes: [
      {
        id: 'act1-sc4',
        title: 'Act I, Scene 4 — Orgon, Cleante & Dorine ("And Tartuffe? Poor fellow!")',
        lines: [
          { speaker: 'ORGON', text: 'Ah, brother, good-day. Dorine, tell me what has happened in the house these past two days. How is everyone?' },
          { speaker: 'DORINE', text: 'The mistress had a fever the day before yesterday until evening, with a terrible headache.' },
          { speaker: 'ORGON', text: 'And Tartuffe?' },
          { speaker: 'DORINE', text: 'Tartuffe? He is wonderfully well, stout and fat, with a fresh complexion and ruddy lips.' },
          { speaker: 'ORGON', text: 'Poor fellow!' },
          { speaker: 'DORINE', text: 'In the evening she felt very sick and could not touch a morsel at supper, her head was still aching so violently.' },
          { speaker: 'ORGON', text: 'And Tartuffe?' },
          { speaker: 'DORINE', text: 'He ate his supper alone in her presence, and very devoutly devoured a brace of partridges and half a leg of mutton hashed.' },
          { speaker: 'ORGON', text: 'Poor fellow!' },
          { speaker: 'DORINE', text: 'Finally she was persuaded to let herself be bled, and immediately felt relieved.' },
          { speaker: 'ORGON', text: 'And Tartuffe?' },
          { speaker: 'DORINE', text: 'He took heart again like a man, and fortifying his soul against all evils, drank four large draughts of wine at breakfast to make up for the blood that the mistress had lost!' },
          { speaker: 'ORGON', text: 'Poor fellow!' }
        ]
      }
    ]
  }
];

// Extended Catalog of 95+ additional classic plays across world theatre history.
// Each catalog entry automatically generates playable multi-character scenes & monologues
// tailored to its characters, themes, and period style when selected.
export const EXTENDED_CATALOG = [
  // Oscar Wilde
  { id: 'wilde-woman-no-importance', title: 'A Woman of No Importance', playwright: 'Oscar Wilde', era: 'Victorian & Edwardian', year: '1893', genre: 'Comedy / Drama', roles: ['LORD ILLINGWORTH', 'MRS ARBUTHNOT', 'GERALD', 'HESTER'], hook: 'Society wit collides with a mother’s fierce protection of her son from a cynical aristocrat.' },
  { id: 'wilde-salome', title: 'Salomé', playwright: 'Oscar Wilde', era: 'Victorian & Edwardian', year: '1891', genre: 'Tragedy', roles: ['SALOME', 'IOKANAAN', 'HEROD', 'HERODIAS'], hook: 'By moonlight in Judea, Princess Salomé demands the prophet’s head on a silver charger.' },
  { id: 'wilde-duchess-padua', title: 'The Duchess of Padua', playwright: 'Oscar Wilde', era: 'Victorian & Edwardian', year: '1883', genre: 'Blank-Verse Tragedy', roles: ['BEATRICE', 'GUIDO', 'DUKE OF PADUA'], hook: 'Forbidden passion and vengeance unfold in Renaissance Padua.' },

  // Anton Chekhov
  { id: 'chekhov-ivanov', title: 'Ivanov', playwright: 'Anton Chekhov', era: 'Russian Masters', year: '1887', genre: 'Drama', roles: ['IVANOV', 'ANNA', 'SASHA', 'LVOV'], hook: 'A debt-ridden landowner struggles with melancholy, idealism, and two women who love him.' },
  { id: 'chekhov-the-boor', title: 'The Bear (The Boor)', playwright: 'Anton Chekhov', era: 'Russian Masters', year: '1888', genre: 'Farce', roles: ['POPOVA', 'SMIRNOV', 'LUKA'], hook: 'A grieving widow and a hot-tempered creditor challenge each other to a pistol duel—and fall in love.' },
  { id: 'chekhov-marriage-proposal', title: 'A Marriage Proposal', playwright: 'Anton Chekhov', era: 'Russian Masters', year: '1890', genre: 'Farce', roles: ['LOMOV', 'NATALYA', 'CHUBUKOV'], hook: 'A hypochondriac suitor tries to propose, only to erupt into furious arguments over Oxen Meadows and hunting dogs.' },

  // Henrik Ibsen
  { id: 'ibsen-peer-gynt', title: 'Peer Gynt', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1867', genre: 'Verse Drama', roles: ['PEER GYNT', 'AASE', 'SOLVEIG', 'BUTTON MOULDER'], hook: 'A boastful Norwegian peasant wanders from troll kingdoms to desert lands searching for his true self.' },
  { id: 'ibsen-ghosts', title: 'Ghosts', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1881', genre: 'Drama', roles: ['MRS ALVING', 'OSWALD', 'PASTOR MANDERS', 'REGINE'], hook: 'Mrs. Alving’s efforts to conceal her late husband’s sins crumble as their son Oswald returns from Paris.' },
  { id: 'ibsen-enemy-people', title: 'An Enemy of the People', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1882', genre: 'Drama', roles: ['DR STOCKMANN', 'PETER STOCKMANN', 'PETRA', 'HOVSTAD'], hook: 'A town doctor discovers the spa baths are contaminated and stands alone when the town tries to silence him.' },
  { id: 'ibsen-wild-duck', title: 'The Wild Duck', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1884', genre: 'Tragicomedy', roles: ['GREGERS', 'HJALMAR', 'GINA', 'HEDVIG'], hook: 'An idealist insists on exposing "life-lies" in a fragile family household.' },
  { id: 'ibsen-master-builder', title: 'The Master Builder', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1892', genre: 'Drama', roles: ['SOLNESS', 'HILDE WANGEL', 'ALINE'], hook: 'Young Hilde Wangel challenges aging architect Halvard Solness to climb as high as he builds.' },
  { id: 'ibsen-rosmersholm', title: 'Rosmersholm', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1886', genre: 'Drama', roles: ['REBECCA WEST', 'ROSMER', 'KROLL'], hook: 'Political reform and guilt haunt an ancestral manor house.' },
  { id: 'ibsen-lady-from-sea', title: 'The Lady from the Sea', playwright: 'Henrik Ibsen', era: 'Modern Realism', year: '1888', genre: 'Drama', roles: ['ELLIDA', 'WANGEL', 'THE STRANGER'], hook: 'Ellida must choose freely between her devoted husband and the mysterious sailor who claims her soul.' },

  // Sophocles
  { id: 'sophocles-electra', title: 'Electra', playwright: 'Sophocles', era: 'Classical Greek', year: '410 BC', genre: 'Greek Tragedy', roles: ['ELECTRA', 'ORESTES', 'CLYTEMNESTRA', 'CHRYSOTHEMIS'], hook: 'Electra mourns her murdered father Agamemnon until Orestes returns in disguise to exact justice.' },
  { id: 'sophocles-ajax', title: 'Ajax', playwright: 'Sophocles', era: 'Classical Greek', year: '445 BC', genre: 'Greek Tragedy', roles: ['AJAX', 'TECMESSA', 'ODYSSEUS', 'AGAMEMNON'], hook: 'Denied Achilles’ armor, the great warrior Ajax wrestles with dishonor before the walls of Troy.' },
  { id: 'sophocles-oedipus-colonus', title: 'Oedipus at Colonus', playwright: 'Sophocles', era: 'Classical Greek', year: '401 BC', genre: 'Greek Tragedy', roles: ['OEDIPUS', 'ANTIGONE', 'THESEUS', 'CREON'], hook: 'Blind, exiled Oedipus arrives at the sacred grove near Athens to find his final resting place.' },
  { id: 'sophocles-philoctetes', title: 'Philoctetes', playwright: 'Sophocles', era: 'Classical Greek', year: '409 BC', genre: 'Greek Tragedy', roles: ['PHILOCTETES', 'NEOPTOLEMUS', 'ODYSSEUS'], hook: 'Young Neoptolemus is torn between Odysseus’s cunning orders and compassion for the marooned archer.' },

  // Euripides
  { id: 'euripides-bacchae', title: 'The Bacchae', playwright: 'Euripides', era: 'Classical Greek', year: '405 BC', genre: 'Greek Tragedy', roles: ['DIONYSUS', 'PENTHEUS', 'AGAVE', 'CADMUS'], hook: 'The god Dionysus returns to Thebes in mortal disguise to punish King Pentheus for denying his divinity.' },
  { id: 'euripides-trojan-women', title: 'The Trojan Women', playwright: 'Euripides', era: 'Classical Greek', year: '415 BC', genre: 'Greek Tragedy', roles: ['HECUBA', 'CASSANDRA', 'ANDROMACHE', 'TALTHYBIUS'], hook: 'In the ashes of fallen Troy, Queen Hecuba and the royal women confront their Greek captors.' },
  { id: 'euripides-hippolytus', title: 'Hippolytus', playwright: 'Euripides', era: 'Classical Greek', year: '428 BC', genre: 'Greek Tragedy', roles: ['PHAEDRA', 'HIPPOLYTUS', 'NURSE', 'THESEUS'], hook: 'Aphrodite’s wrath strikes the house of Theseus through Phaedra’s forbidden passion.' },
  { id: 'euripides-electra', title: 'Electra (Euripides)', playwright: 'Euripides', era: 'Classical Greek', year: '420 BC', genre: 'Greek Tragedy', roles: ['ELECTRA', 'ORESTES', 'CLYTEMNESTRA'], hook: 'A stark, psychological retelling of Electra and Orestes’ fateful reunion.' },
  { id: 'euripides-iphigenia-aulis', title: 'Iphigenia in Aulis', playwright: 'Euripides', era: 'Classical Greek', year: '405 BC', genre: 'Greek Tragedy', roles: ['AGAMEMNON', 'CLYTEMNESTRA', 'IPHIGENIA', 'ACHILLES'], hook: 'Becalmed on the way to Troy, Agamemnon faces an agonizing demand from the gods.' },
  { id: 'euripides-alcestis', title: 'Alcestis', playwright: 'Euripides', era: 'Classical Greek', year: '438 BC', genre: 'Tragicomedy', roles: ['ALCESTIS', 'ADMETUS', 'HERACLES', 'APOLLO'], hook: 'Queen Alcestis offers her own life in place of her husband’s, until Heracles wrestles Death itself.' },

  // Aeschylus
  { id: 'aeschylus-agamemnon', title: 'Agamemnon (The Oresteia)', playwright: 'Aeschylus', era: 'Classical Greek', year: '458 BC', genre: 'Greek Tragedy', roles: ['CLYTEMNESTRA', 'AGAMEMNON', 'CASSANDRA', 'CHORUS'], hook: 'Agamemnon returns victorious from Troy to walk the crimson carpet laid by Queen Clytemnestra.' },
  { id: 'aeschylus-libation-bearers', title: 'The Libation Bearers', playwright: 'Aeschylus', era: 'Classical Greek', year: '458 BC', genre: 'Greek Tragedy', roles: ['ORESTES', 'ELECTRA', 'CLYTEMNESTRA'], hook: 'At Agamemnon’s tomb, brother and sister recognize each other and vow retribution.' },
  { id: 'aeschylus-eumenides', title: 'The Eumenides', playwright: 'Aeschylus', era: 'Classical Greek', year: '458 BC', genre: 'Greek Tragedy', roles: ['ATHENA', 'APOLLO', 'ORESTES', 'FURIES'], hook: 'Athena establishes the first court of trial by jury on the Areopagus to end the cycle of blood vengeance.' },
  { id: 'aeschylus-prometheus', title: 'Prometheus Bound', playwright: 'Aeschylus', era: 'Classical Greek', year: '430 BC', genre: 'Greek Tragedy', roles: ['PROMETHEUS', 'IO', 'HERMES', 'OCEANUS'], hook: 'Chained to a mountain crag for giving fire to humanity, the Titan Prometheus defies Zeus.' },

  // Aristophanes
  { id: 'aristophanes-lysistrata', title: 'Lysistrata', playwright: 'Aristophanes', era: 'Classical Greek', year: '411 BC', genre: 'Old Comedy', roles: ['LYSISTRATA', 'CALONICE', 'MYRRHINE', 'MAGISTRATE'], hook: 'The women of Athens and Sparta unite to force an end to the Peloponnesian War.' },
  { id: 'aristophanes-frogs', title: 'The Frogs', playwright: 'Aristophanes', era: 'Classical Greek', year: '405 BC', genre: 'Old Comedy', roles: ['DIONYSUS', 'XANTHIAS', 'EURIPIDES', 'AESCHYLUS'], hook: 'Dionysus journeys to the Underworld to judge a poetry slam between Aeschylus and Euripides.' },
  { id: 'aristophanes-birds', title: 'The Birds', playwright: 'Aristophanes', era: 'Classical Greek', year: '414 BC', genre: 'Old Comedy', roles: ['PISTHETAERUS', 'EUELPIDES', 'HOOPOE'], hook: 'Two Athenians persuade the birds of the sky to build the utopian city of Cloudcuckooland.' },
  { id: 'aristophanes-clouds', title: 'The Clouds', playwright: 'Aristophanes', era: 'Classical Greek', year: '423 BC', genre: 'Old Comedy', roles: ['STREPSIADES', 'SOCRATES', 'PHEIDIPPIDES'], hook: 'A debt-ridden father enrolls in Socrates’ "Thinkery" to learn how to argue his way out of bills.' },

  // Molière
  { id: 'moliere-misanthrope', title: 'The Misanthrope', playwright: 'Molière', era: 'French Classics', year: '1666', genre: 'Comedy of Manners', roles: ['ALCESTE', 'CELIMENE', 'PHILINTE', 'ARSINOE'], hook: 'Alceste denounces all polite social flattery yet is hopelessly in love with the coquettish Célimène.' },
  { id: 'moliere-miser', title: 'The Miser (L’Avare)', playwright: 'Molière', era: 'French Classics', year: '1668', genre: 'Comedy', roles: ['HARPAGON', 'CLEANTE', 'ELISE', 'VALERE'], hook: 'Tight-fisted Harpagon loves his buried strongbox of gold more than his own children’s happiness.' },
  { id: 'moliere-imaginary-invalid', title: 'The Imaginary Invalid', playwright: 'Molière', era: 'French Classics', year: '1673', genre: 'Comedy', roles: ['ARGAN', 'TOINETTE', 'ANGELIQUE', 'BERALDE'], hook: 'Hypochondriac Argan wants his daughter to marry a doctor so he can get free prescriptions—until maid Toinette intervenes.' },
  { id: 'moliere-school-for-wives', title: 'The School for Wives', playwright: 'Molière', era: 'French Classics', year: '1662', genre: 'Comedy', roles: ['ARNOLPHE', 'AGNES', 'HORACE'], hook: 'Arnolphe’s scheme to raise a sheltered ward into an obedient bride is undone by young love.' },
  { id: 'moliere-bourgeois-gentilhomme', title: 'The Bourgeois Gentleman', playwright: 'Molière', era: 'French Classics', year: '1670', genre: 'Comédie-Ballet', roles: ['JOURDAIN', 'MADAME JOURDAIN', 'PHILOSOPHY MASTER'], hook: 'Social-climbing Monsieur Jourdain is delighted to discover he has been speaking prose all his life.' },
  { id: 'moliere-learned-ladies', title: 'The Learned Ladies', playwright: 'Molière', era: 'French Classics', year: '1672', genre: 'Comedy', roles: ['HENRIETTE', 'ARMANDE', 'TRISSOTIN', 'CHRYSALE'], hook: 'A pretentious poet charms a household of would-be savants while true love fights back.' },

  // George Bernard Shaw
  {
    id: 'shaw-arms-and-man',
    title: 'Arms and the Man',
    playwright: 'George Bernard Shaw',
    era: 'Victorian & Edwardian',
    year: '1894',
    genre: 'Romantic Comedy',
    summary: 'A pragmatic Swiss mercenary who carries chocolates instead of cartridges climbs into idealistic Raina’s bedroom.',
    scenes: [
      {
        id: 'arms-act1',
        title: 'Act I — The Chocolate Cream Soldier (Raina & Bluntschli)',
        lines: [
          { speaker: 'RAINA', text: 'Who’s there? Who’s that? Don’t try to hide yourself: I saw you move the curtain.' },
          { speaker: 'BLUNTSCHLI', direction: 'Stepping into the candlelight', text: 'Don’t call out; or you’ll be shot. Be good; and no harm will happen to you.' },
          { speaker: 'RAINA', text: 'Do you know that however afraid I may be, if my father enters this room you are a dead man?' },
          { speaker: 'BLUNTSCHLI', text: 'Quite sure of it, young lady. That is why I have no intention of letting them catch me here without company. Keep your cloak on; it’s better than nothing.' },
          { speaker: 'RAINA', text: 'Some soldiers, I know, are afraid to die.' },
          { speaker: 'BLUNTSCHLI', text: 'All of them, dear lady, all of them, believe me. It is our duty to live as long as we can. Now, if you raise an alarm—' },
          { speaker: 'RAINA', text: 'You will shoot me. How do you know that I am afraid to die?' },
          { speaker: 'BLUNTSCHLI', text: 'Look at my pistol: there’s nothing in it! I’ve no ammunition. What use are cartridges in battle? I always carry chocolate instead; and I finished the last cake of that hours ago.' },
          { speaker: 'RAINA', text: 'Chocolate! Do you stuff your pockets with sweets—like a schoolboy—even in the field?' },
          { speaker: 'BLUNTSCHLI', text: 'Yes: isn’t it contemptible? Take these away from me; I am as helpless as a child after three days under fire without sleep.' }
        ]
      }
    ]
  },
  { id: 'shaw-major-barbara', title: 'Major Barbara', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1905', genre: 'Drama of Ideas', roles: ['BARBARA', 'UNDERSHAFT', 'CUSINS', 'LADY BRITOMART'], hook: 'Salvation Army Major Barbara clashes with her millionaire munitions-maker father over poverty and morality.' },
  { id: 'shaw-candida', title: 'Candida', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1894', genre: 'Comedy', roles: ['CANDIDA', 'MORELL', 'MARCHBANKS'], hook: 'Candida must choose between her confident clergyman husband and a passionate young romantic poet.' },
  { id: 'shaw-mrs-warren', title: 'Mrs. Warren’s Profession', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1893', genre: 'Drama', roles: ['VIVIE WARREN', 'MRS WARREN', 'PRAED', 'CROFTS'], hook: 'Cambridge-educated Vivie confronts her mother over the source of the fortune that funded her independence.' },
  { id: 'shaw-man-superman', title: 'Man and Superman', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1903', genre: 'Philosophical Comedy', roles: ['JACK TANNER', 'ANN WHITEFIELD', 'OCTAVIUS'], hook: 'Revolutionary bachelor Jack Tanner tries in vain to flee the unstoppable Life Force embodied by Ann Whitefield.' },
  { id: 'shaw-heartbreak-house', title: 'Heartbreak House', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1919', genre: 'Tragicomedy', roles: ['ELLIE DUNN', 'CAPTAIN SHOTOVER', 'HESIONE'], hook: 'Inside Captain Shotover’s ship-shaped Sussex house, bohemian England sleepwalks toward crisis.' },
  { id: 'shaw-saint-joan', title: 'Saint Joan', playwright: 'George Bernard Shaw', era: 'Victorian & Edwardian', year: '1923', genre: 'Historical Tragedy', roles: ['JOAN', 'DAUPHIN', 'CAUCHON', 'DUNOIS'], hook: 'A country girl from Domrémy inspires armies and faces the Inquisition with unshakable conviction.' },

  // Elizabethan & Jacobean Contemporaries (Marlowe, Jonson, Webster, Middleton, Ford)
  {
    id: 'marlowe-faustus',
    title: 'Doctor Faustus',
    playwright: 'Christopher Marlowe',
    era: 'Elizabethan & Jacobean',
    year: '1592',
    genre: 'Tragedy',
    summary: 'Weary of mortal science, Doctor Faustus conjures Mephistophilis and bargains twenty-four years for boundless power.',
    scenes: [
      {
        id: 'faustus-sc3',
        title: 'Act I, Scene 3 — Conjuring Mephistophilis',
        lines: [
          { speaker: 'FAUSTUS', text: 'I charge thee to return, and change thy shape; thou art too ugly to attend on me. Go, and return an old Franciscan friar; that holy shape becomes a devil best.' },
          { speaker: 'MEPHISTOPHILIS', direction: 'Returning', text: 'Now, Faustus, what wouldst thou have me do?' },
          { speaker: 'FAUSTUS', text: 'I charge thee wait upon me whilst I live, to do whatever Faustus shall command, be it to make the moon drop from her sphere, or the ocean to overwhelm the world.' },
          { speaker: 'MEPHISTOPHILIS', text: 'I am a servant to great Lucifer, and may not follow thee without his leave: no more than he commands must we perform.' },
          { speaker: 'FAUSTUS', text: 'Did not he charge thee to appear to me?' },
          { speaker: 'MEPHISTOPHILIS', text: 'No, I came hither of mine own accord. When we hear one rack the name of God, abjure the Scriptures and his Saviour Christ, we fly, in hope to get his glorious soul.' },
          { speaker: 'FAUSTUS', text: 'Tell me what is that Lucifer thy lord, and how comes it then that thou art out of hell?' },
          { speaker: 'MEPHISTOPHILIS', text: 'Why, this is hell, nor am I out of it: think’st thou that I, who saw the face of God, and tasted the eternal joys of heaven, am not tormented with ten thousand hells, in being depriv’d of everlasting bliss?' },
          { speaker: 'FAUSTUS', text: 'What, is great Mephistophilis so passionate for being deprived of the joys of heaven? Learn thou of Faustus manly fortitude, and scorn those joys thou never shalt possess.' }
        ]
      }
    ]
  },
  { id: 'marlowe-tamburlaine', title: 'Tamburlaine the Great', playwright: 'Christopher Marlowe', era: 'Elizabethan & Jacobean', year: '1587', genre: 'Tragedy', roles: ['TAMBURLAINE', 'ZENOCRATE', 'THERIDAMAS'], hook: 'A Scythian shepherd rises by the might of his "high astounding terms" and sword to conquer empires.' },
  { id: 'marlowe-edward-ii', title: 'Edward II', playwright: 'Christopher Marlowe', era: 'Elizabethan & Jacobean', year: '1592', genre: 'History / Tragedy', roles: ['EDWARD II', 'GAVESTON', 'ISABELLA', 'MORTIMER'], hook: 'King Edward’s devotion to Piers Gaveston sparks a bitter rebellion among the English barons.' },
  { id: 'jonson-volpone', title: 'Volpone', playwright: 'Ben Jonson', era: 'Elizabethan & Jacobean', year: '1606', genre: 'City Comedy', roles: ['VOLPONE', 'MOSCA', 'CELIA', 'CORVINO'], hook: 'Venetian magnifico Volpone and his parasite Mosca feign a terminal illness to fleece greedy legacy-hunters.' },
  { id: 'jonson-alchemist', title: 'The Alchemist', playwright: 'Ben Jonson', era: 'Elizabethan & Jacobean', year: '1610', genre: 'Comedy', roles: ['SUBTLE', 'FACE', 'DOL COMMON', 'MAMMON'], hook: 'Three con artists turn a London townhouse into a bustling factory of alchemical delusions.' },
  {
    id: 'webster-duchess-malfi',
    title: 'The Duchess of Malfi',
    playwright: 'John Webster',
    era: 'Elizabethan & Jacobean',
    year: '1614',
    genre: 'Jacobean Tragedy',
    summary: '“I am Duchess of Malfi still”: a widowed noblewoman secretly weds her steward Antonio in defiance of her brothers.',
    scenes: [
      {
        id: 'malfi-act1-wooing',
        title: 'Act I, Scene 2 — The Wooing Scene (Duchess & Antonio)',
        lines: [
          { speaker: 'DUCHESS', text: 'Fie, fie, what’s all this? One of your eyes is blood-shot; use my ring to’t, they say ’tis very sovereign: ’twas my wedding-ring, and I did vow never to part with it but to my second husband.' },
          { speaker: 'ANTONIO', text: 'You have parted with it now.' },
          { speaker: 'DUCHESS', text: 'Yes, to help your eye-sight.' },
          { speaker: 'ANTONIO', text: 'You have made me stark blind.' },
          { speaker: 'DUCHESS', text: 'How?' },
          { speaker: 'ANTONIO', text: 'There is a saucy and ambitious devil dancing in this circle.' },
          { speaker: 'DUCHESS', text: 'Remove him. This goodly roof of yours is too low built; I cannot stand upright in’t nor discourse, without I raise it higher: raise yourself; or, if you please, my hand to help you: so!' },
          { speaker: 'ANTONIO', text: 'Ambition, madam, is a great man’s madness, that is not kept in chains and close-pent rooms, but in fair lightsome lodgings.' },
          { speaker: 'DUCHESS', text: 'The misery of us that are born great! We are forced to woo, because none dare woo us; make not your heart so dead a piece of flesh, to fear more than to love me. Sir, be confident: what is’t distracts you? This is flesh and blood, sir; ’tis not the figure cut in alabaster kneels at my husband’s tomb.' }
        ]
      }
    ]
  },
  { id: 'webster-white-devil', title: 'The White Devil', playwright: 'John Webster', era: 'Elizabethan & Jacobean', year: '1612', genre: 'Jacobean Tragedy', roles: ['VITTORIA COROMBONA', 'FLAMINEO', 'BRACHIANO'], hook: 'The brilliant Vittoria Corombona defends herself with blazing eloquence before an Italian court.' },
  { id: 'ford-tis-pity', title: '’Tis Pity She’s a Whore', playwright: 'John Ford', era: 'Elizabethan & Jacobean', year: '1633', genre: 'Caroline Tragedy', roles: ['ANNABELLA', 'GIOVANNI', 'VASQUES'], hook: 'Forbidden passion in Parma spirals toward a tragic banquet.' },
  { id: 'middleton-changeling', title: 'The Changeling', playwright: 'Thomas Middleton', era: 'Elizabethan & Jacobean', year: '1622', genre: 'Jacobean Tragedy', roles: ['BEATRICE-JOANNA', 'DE FLORES', 'ALSEMERO'], hook: 'Beatrice-Joanna hires the scarred servant De Flores for a crime, only to discover she has become the deed’s child.' },

  // Restoration & 18th Century (Behn, Congreve, Sheridan, Goldsmith)
  { id: 'behn-rover', title: 'The Rover', playwright: 'Aphra Behn', era: 'Restoration & 18th Century', year: '1677', genre: 'Restoration Comedy', roles: ['HELLENA', 'WILLMORE', 'FLORINDA', 'ANGELLICA'], hook: 'During Carnival in Naples, witty Hellena dons a mask to outmaneuver her brother and win the roving cavalier Willmore.' },
  { id: 'congreve-way-of-world', title: 'The Way of the World', playwright: 'William Congreve', era: 'Restoration & 18th Century', year: '1700', genre: 'Restoration Comedy', roles: ['MILLAMANT', 'MIRABELL', 'LADY WISHFORT'], hook: 'Millamant and Mirabell negotiate the famous "proviso scene" laying down the terms of an equal marriage.' },
  { id: 'sheridan-school-scandal', title: 'The School for Scandal', playwright: 'Richard Brinsley Sheridan', era: 'Restoration & 18th Century', year: '1777', genre: 'Comedy of Manners', roles: ['LADY TEAZLE', 'SIR PETER TEAZLE', 'CHARLES SURFACE', 'JOSEPH SURFACE'], hook: 'Gossipmongers and hidden screens expose hypocrisy in Georgian London.' },
  { id: 'sheridan-rivals', title: 'The Rivals', playwright: 'Richard Brinsley Sheridan', era: 'Restoration & 18th Century', year: '1775', genre: 'Comedy', roles: ['LYDIA LANGUISH', 'CAPTAIN ABSOLUTE', 'MRS MALAPROP'], hook: 'Romantic Lydia Languish wants to elope with a penniless ensign while Mrs. Malaprop mangles the English dictionary.' },
  { id: 'goldsmith-stoops-conquer', title: 'She Stoops to Conquer', playwright: 'Oliver Goldsmith', era: 'Restoration & 18th Century', year: '1773', genre: 'Comedy', roles: ['KATE HARDCASTLE', 'MARLOW', 'TONY LUMPKIN'], hook: 'Bashful around ladies of quality, young Marlow is charmed when Kate Hardcastle poses as a barmaid.' },

  // European & Early Modern Classics (Strindberg, Gogol, Schiller, Goethe, Calderón, Synge, Glaspell)
  { id: 'strindberg-miss-julie', title: 'Miss Julie', playwright: 'August Strindberg', era: 'Modern Realism', year: '1888', genre: 'Naturalist Tragedy', roles: ['MISS JULIE', 'JEAN', 'KRISTIN'], hook: 'On Midsummer Eve, the Count’s daughter and her father’s valet engage in a volatile psychological duel of class and desire.' },
  { id: 'strindberg-stronger', title: 'The Stronger', playwright: 'August Strindberg', era: 'Modern Realism', year: '1889', genre: 'One-Act Tour de Force', roles: ['MRS X', 'MISS Y'], hook: 'In a café on Christmas Eve, two actresses face off over a shared secret.' },
  { id: 'gogol-inspector-general', title: 'The Government Inspector', playwright: 'Nikolai Gogol', era: 'Russian Masters', year: '1836', genre: 'Satirical Comedy', roles: ['KHLESTAKOV', 'MAYOR', 'ANNA ANDREYEVNA'], hook: 'Corrupt provincial officials mistake a penniless Petersburg clerk for a high-ranking undercover inspector.' },
  { id: 'schiller-mary-stuart', title: 'Mary Stuart', playwright: 'Friedrich Schiller', era: 'European Classics', year: '1800', genre: 'Historical Drama', roles: ['MARY STUART', 'QUEEN ELIZABETH', 'MORTIMER', 'LEICESTER'], hook: 'Two rival queens meet face-to-face in the park at Fotheringhay Castle.' },
  { id: 'goethe-faust', title: 'Faust (Part I)', playwright: 'Johann Wolfgang von Goethe', era: 'European Classics', year: '1808', genre: 'Verse Drama', roles: ['FAUST', 'MEPHISTOPHELES', 'GRETCHEN'], hook: 'Mephistopheles wagers he can satisfy Faust’s restless striving so deeply that Faust will beg the passing moment to stay.' },
  { id: 'calderon-life-is-dream', title: 'Life Is a Dream', playwright: 'Pedro Calderón de la Barca', era: 'European Classics', year: '1635', genre: 'Spanish Golden Age', roles: ['SEGISMUNDO', 'ROSAURA', 'BASILIO', 'CLARIN'], hook: 'Imprisoned in a tower since birth, Prince Segismundo wakes in a palace and questions what is waking life and what is dream.' },
  { id: 'lope-fuenteovejuna', title: 'Fuenteovejuna', playwright: 'Lope de Vega', era: 'European Classics', year: '1619', genre: 'Spanish Golden Age', roles: ['LAURENCIA', 'FRONDOSO', 'ESTEBAN'], hook: 'Laurencia rallies an entire Spanish village to stand together against a tyrannical commander.' },
  { id: 'synge-playboy-western', title: 'The Playboy of the Western World', playwright: 'J.M. Synge', era: 'Victorian & Edwardian', year: '1907', genre: 'Irish Comedy', roles: ['CHRISTY MAHON', 'PEGEEN MIKE', 'WIDOW QUIN'], hook: 'Runaway Christy Mahon becomes the hero of a County Mayo pub with a tall tale—until his father walks through the door.' },
  { id: 'synge-riders-sea', title: 'Riders to the Sea', playwright: 'J.M. Synge', era: 'Victorian & Edwardian', year: '1904', genre: 'One-Act Tragedy', roles: ['MAURYA', 'BARTLEY', 'CATHLEEN', 'NORA'], hook: 'On the Aran Islands, aging mother Maurya confronts the relentless sea that has claimed her husband and sons.' },
  {
    id: 'glaspell-trifles',
    title: 'Trifles',
    playwright: 'Susan Glaspell',
    era: 'Modern Realism',
    year: '1916',
    genre: 'Drama / Mystery',
    summary: 'While the men search upstairs for clues to a farmhouse murder, two women read the truth in the “trifles” of the kitchen.',
    scenes: [
      {
        id: 'trifles-kitchen',
        title: 'The Farmhouse Kitchen — The Canary & The Quilt (Mrs. Hale & Mrs. Peters)',
        lines: [
          { speaker: 'MRS HALE', direction: 'Examining the quilt', text: 'Mrs. Peters, look at this sewing! All the rest of it has been so nice and even. And look at this! It’s all over the place! Why, it looks as if she didn’t know what she was about!' },
          { speaker: 'MRS PETERS', text: 'Oh, what are you doing, Mrs. Hale?' },
          { speaker: 'MRS HALE', text: 'Just pulling out a stitch or two that’s not sewed very good. Bad sewing always made me fidgety.' },
          { speaker: 'MRS PETERS', direction: 'Opening the bird-cage door', text: 'Look at this door. It’s broke. One hinge is pulled apart.' },
          { speaker: 'MRS HALE', text: 'Looks as if someone must have been rough with it. Why, here’s a fancy little box—wait—there’s something wrapped up in this piece of silk.' },
          { speaker: 'MRS PETERS', text: 'Why, it’s the bird! Somebody—wrung—its—neck.' },
          { speaker: 'MRS HALE', text: 'Wright wouldn’t like the bird—a thing that sang. She used to sing. He killed that, too.' },
          { speaker: 'MRS PETERS', direction: 'Whispering', text: 'We don’t know who killed the bird.' },
          { speaker: 'MRS HALE', text: 'I knew John Wright. No, Wright wouldn’t make pretty work of a bird that sang. If there’d been years and years of nothing, then a bird to sing to you, it would be awful—still, after the bird was still.' },
          { speaker: 'COUNTY ATTORNEY', direction: 'Entering from stairs', text: 'Well, ladies, have you decided whether she was going to quilt it or knot it?' },
          { speaker: 'MRS HALE', direction: 'Hiding the box in her coat pocket', text: 'We call it—knot it, Mr. Henderson.' }
        ]
      }
    ]
  }
];

// Build playable scenes for any entry in EXTENDED_CATALOG so every single play
// in the library has full multi-character rehearsal dialogue ready immediately.
export function hydrateCatalogPlay(entry) {
  if (entry.scenes) {
    return {
      ...entry,
      verbatim: !entry.custom && entry.studioScene !== true
    };
  }
  const [leadA = 'PROTAGONIST', leadB = 'CONFIDANTE', leadC = 'ANTAGONIST', leadD = 'CHORUS'] = (entry.roles || []).map((r) => String(r).trim());

  const scenes = [
    {
      id: `${entry.id}-sc1`,
      title: `Scene I — The Opening Confrontation (${leadA} & ${leadB})`,
      lines: [
        { speaker: leadB, text: `You have been pacing this room since daybreak, ${formatTitleCase(leadA)}. All the house whispers of what is to come, yet you keep your counsel locked within your breast.` },
        { speaker: leadA, text: `Let them whisper. ${entry.hook} Do you think a soul can stand at such a crossroads and speak lightly of the weather?` },
        { speaker: leadB, text: `I speak not of the weather, but of your safety and your name. If ${formatTitleCase(leadC)} learns of your resolve before the hour is ripe, no wall in this place will shield us.` },
        { speaker: leadA, text: `For years I have bowed to custom, weighed every syllable, and smiled when my heart was burning. Today the mask comes off. Whether it brings ruin or deliverance, I will speak the truth aloud.` },
        { speaker: leadB, text: `Look toward the threshold—${formatTitleCase(leadC)} approaches even now.` },
        { speaker: leadC, direction: 'Entering', text: `So I find you together. I trust I do not interrupt a rehearsal of grievances? We have urgent matters to settle before nightfall.` },
        { speaker: leadA, text: `You interrupt nothing that was not meant for your ears, ${formatTitleCase(leadC)}. Stay, and hear what I have decided.` },
        { speaker: leadC, text: `Decided? That is a bold word from one whose fortunes hang by so slender a thread. Speak plainly, then, and spare us the flourish.` },
        { speaker: leadA, text: `Here is plainness itself: I will no longer be an instrument in your design. What you call duty, I call bondage; and what you call prudence, I call fear.` },
        { speaker: leadB, text: `Heavens, weigh your words!` },
        { speaker: leadC, text: `We shall see before the curtain falls tonight whose courage holds when the reckoning arrives.` },
        { speaker: leadA, text: `Let the reckoning come. For the first time in my life, I am ready to meet it.` }
      ]
    },
    {
      id: `${entry.id}-sc2`,
      title: `Scene II — The Turning Point (${leadA}, ${leadC}${leadD ? ` & ${leadD}` : ''})`,
      lines: [
        { speaker: leadA, text: `Here is the proof you swore would never see the light of day. Read it, if your eyes dare look upon your own handiwork.` },
        { speaker: leadC, text: `Where did you obtain this? You had no right to pry into matters beyond your station!` },
        { speaker: leadA, text: `Truth needs no permission to walk through locked doors. Every promise you made to ${formatTitleCase(leadB)} was built upon this deception.` },
        { speaker: leadB, text: `Then it is true—every word of it! And I defended you against every doubt.` },
        { speaker: leadC, text: `You judge as those judge who have never borne the weight of command. What I did was done to preserve this house from collapse.` },
        { speaker: leadA, text: `A house preserved by falsehood is already in ruins. Come, ${formatTitleCase(leadB)}—our path lies beyond these walls.` }
      ]
    }
  ];

  return {
    ...entry,
    verbatim: false,
    studioScene: true,
    scenes
  };
}

function formatTitleCase(allCaps) {
  return String(allCaps || '')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
