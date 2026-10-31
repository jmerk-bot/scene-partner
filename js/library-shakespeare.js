// William Shakespeare — Top 20 Plays (excluding the minor histories).
// Organized with key audition & rehearsal scenes, multi-character exchanges,
// and famous soliloquies/duologues.

export const SHAKESPEARE_PLAYS = [
  {
    id: 'shake-hamlet',
    title: 'Hamlet',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1600',
    genre: 'Tragedy',
    summary: 'The Prince of Denmark confronts his father’s ghost, feigns madness, and seeks truth in a corrupt court.',
    scenes: [
      {
        id: 'act1-sc2',
        title: 'Act I, Scene 2 — The Court of Elsinore & Horatio’s News',
        lines: [
          { speaker: 'CLAUDIUS', text: 'Though yet of Hamlet our dear brother’s death the memory be green, and that it us befitted to bear our hearts in grief, yet so far hath discretion fought with nature that we with wisest sorrow think on him.' },
          { speaker: 'GERTRUDE', text: 'Good Hamlet, cast thy nighted colour off, and let thine eye look like a friend on Denmark. Do not for ever with thy vailed lids seek for thy noble father in the dust: thou know’st ’tis common; all that lives must die, passing through nature to eternity.' },
          { speaker: 'HAMLET', text: 'Ay, madam, it is common.' },
          { speaker: 'GERTRUDE', text: 'If it be, why seems it so particular with thee?' },
          { speaker: 'HAMLET', text: 'Seems, madam! Nay, it is; I know not "seems." ’Tis not alone my inky cloak, good mother, nor customary suits of solemn black, nor windy suspiration of forced breath, no, nor the fruitful river in the eye, that can denote me truly: these indeed seem, for they are actions that a man might play: but I have that within which passeth show; these but the trappings and the suits of woe.' },
          { speaker: 'CLAUDIUS', text: '’Tis sweet and commendable in your nature, Hamlet, to give these mourning duties to your father: but you must know, your father lost a father; that father lost, lost his.' },
          { speaker: 'HAMLET', text: 'O, that this too too solid flesh would melt, thaw and resolve itself into a dew! Or that the Everlasting had not fix’d his canon ’gainst self-slaughter! O God! God! How weary, stale, flat and unprofitable, seem to me all the uses of this world!' },
          { speaker: 'HORATIO', direction: 'Entering with Marcellus', text: 'Hail to your lordship!' },
          { speaker: 'HAMLET', text: 'I am glad to see you well: Horatio—or I do forget myself.' },
          { speaker: 'HORATIO', text: 'The same, my lord, and your poor servant ever.' },
          { speaker: 'HAMLET', text: 'Sir, my good friend; I’ll change that name with you: and what make you from Wittenberg, Horatio?' },
          { speaker: 'HORATIO', text: 'A truant disposition, good my lord.' },
          { speaker: 'HAMLET', text: 'I would not hear your enemy say so, nor shall you do my ear that violence, to make it truster of your own report against yourself. But what is your affair in Elsinore? We’ll teach you to drink deep ere you depart.' },
          { speaker: 'HORATIO', text: 'My lord, I came to see your father’s funeral.' },
          { speaker: 'HAMLET', text: 'I pray thee, do not mock me, fellow-student; I think it was to see my mother’s wedding.' },
          { speaker: 'HORATIO', text: 'Indeed, my lord, it follow’d hard upon.' },
          { speaker: 'HAMLET', text: 'Thrift, thrift, Horatio! The funeral baked meats did coldly furnish forth the marriage tables. My father—methinks I see my father.' },
          { speaker: 'HORATIO', text: 'Where, my lord?' },
          { speaker: 'HAMLET', text: 'In my mind’s eye, Horatio.' },
          { speaker: 'HORATIO', text: 'I saw him once; he was a goodly king.' },
          { speaker: 'HAMLET', text: 'He was a man, take him for all in all, I shall not look upon his like again.' },
          { speaker: 'HORATIO', text: 'My lord, I think I saw him yesternight.' },
          { speaker: 'HAMLET', text: 'Saw? Who?' },
          { speaker: 'HORATIO', text: 'My lord, the king your father.' },
          { speaker: 'HAMLET', text: 'The king my father! For God’s love, let me hear.' }
        ]
      },
      {
        id: 'act3-sc1',
        title: 'Act III, Scene 1 — "To be, or not to be" & Ophelia',
        lines: [
          { speaker: 'HAMLET', text: 'To be, or not to be, that is the question: whether ’tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them?' },
          { speaker: 'HAMLET', text: 'To die: to sleep; no more; and by a sleep to say we end the heart-ache and the thousand natural shocks that flesh is heir to, ’tis a consummation devoutly to be wish’d. To die, to sleep; to sleep: perchance to dream: ay, there’s the rub; for in that sleep of death what dreams may come when we have shuffled off this mortal coil, must give us pause.' },
          { speaker: 'HAMLET', text: 'Soft you now! The fair Ophelia! Nymph, in thy orisons be all my sins remember’d.' },
          { speaker: 'OPHELIA', text: 'Good my lord, how does your honour for this many a day?' },
          { speaker: 'HAMLET', text: 'I humbly thank you; well, well, well.' },
          { speaker: 'OPHELIA', text: 'My lord, I have remembrances of yours, that I have longed long to re-deliver; I pray you, now receive them.' },
          { speaker: 'HAMLET', text: 'No, not I; I never gave you aught.' },
          { speaker: 'OPHELIA', text: 'My honour’d lord, you know right well you did; and, with them, words of so sweet breath composed as made the things more rich: their perfume lost, take these again; for to the noble mind rich gifts wax poor when givers prove unkind.' },
          { speaker: 'HAMLET', text: 'Ha, ha! Are you honest?' },
          { speaker: 'OPHELIA', text: 'My lord?' },
          { speaker: 'HAMLET', text: 'Are you fair?' },
          { speaker: 'OPHELIA', text: 'What means your lordship?' },
          { speaker: 'HAMLET', text: 'That if you be honest and fair, your honesty should admit no discourse to your beauty.' },
          { speaker: 'OPHELIA', text: 'Could beauty, my lord, have better commerce than with honesty?' },
          { speaker: 'HAMLET', text: 'Ay, truly; for the power of beauty will sooner transform honesty from what it is to a bawd than the force of honesty can translate beauty into his likeness: this was sometime a paradox, but now the time gives it proof. I did love you once.' },
          { speaker: 'OPHELIA', text: 'Indeed, my lord, you made me believe so.' },
          { speaker: 'HAMLET', text: 'You should not have believed me; for virtue cannot so inoculate our old stock but we shall relish of it: I loved you not.' },
          { speaker: 'OPHELIA', text: 'I was the more deceived.' },
          { speaker: 'HAMLET', text: 'Get thee to a nunnery: why wouldst thou be a breeder of sinners? I am myself indifferent honest; but yet I could accuse me of such things that it were better my mother had not borne me.' },
          { speaker: 'OPHELIA', text: 'O, help him, you sweet heavens!' }
        ]
      }
    ]
  },
  {
    id: 'shake-macbeth',
    title: 'Macbeth',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1606',
    genre: 'Tragedy',
    summary: 'Spurred by prophecy and fierce ambition, Macbeth and Lady Macbeth seize the Scottish crown at a terrible cost.',
    scenes: [
      {
        id: 'act1-sc7',
        title: 'Act I, Scene 7 — "Screw your courage to the sticking-place"',
        lines: [
          { speaker: 'MACBETH', text: 'If it were done when ’tis done, then ’twere well it were done quickly: if the assassination could trammel up the consequence, and catch with his surcease success; that but this blow might be the be-all and the end-all here, we’d jump the life to come.' },
          { speaker: 'LADY MACBETH', direction: 'Entering', text: 'He has almost supp’d: why have you left the chamber?' },
          { speaker: 'MACBETH', text: 'Hath he ask’d for me?' },
          { speaker: 'LADY MACBETH', text: 'Know you not he has?' },
          { speaker: 'MACBETH', text: 'We will proceed no further in this business: he hath honour’d me of late; and I have bought golden opinions from all sorts of people, which would be worn now in their newest gloss, not cast aside so soon.' },
          { speaker: 'LADY MACBETH', text: 'Was the hope drunk wherein you dress’d yourself? Hath it slept since? And wakes it now, to look so green and pale at what it did so freely? From this time such I account thy love.' },
          { speaker: 'MACBETH', text: 'Prithee, peace: I dare do all that may become a man; who dares do more is none.' },
          { speaker: 'LADY MACBETH', text: 'What beast was’t, then, that made you break this enterprise to me? When you durst do it, then you were a man; and, to be more than what you were, you would be so much more the man.' },
          { speaker: 'MACBETH', text: 'If we should fail?' },
          { speaker: 'LADY MACBETH', text: 'We fail! But screw your courage to the sticking-place, and we’ll not fail. When Duncan is asleep—whereto the rather shall his day’s hard journey soundly invite him—his two chamberlains will I with wine and wassail so convince that memory, the warder of the brain, shall be a fume.' },
          { speaker: 'MACBETH', text: 'Bring forth men-children only; for thy undaunted mettle should compose nothing but males. I am settled, and bend up each corporal agent to this terrible feat. Away, and mock the time with fairest show: false face must hide what the false heart doth know.' }
        ]
      },
      {
        id: 'act2-sc2',
        title: 'Act II, Scene 2 — The Dagger & The Murder of Duncan',
        lines: [
          { speaker: 'MACBETH', text: 'Is this a dagger which I see before me, the handle toward my hand? Come, let me clutch thee. I have thee not, and yet I see thee still. Art thou not, fatal vision, sensible to feeling as to sight? Or art thou but a dagger of the mind, a false creation, proceeding from the heat-oppressed brain?' },
          { speaker: 'LADY MACBETH', text: 'That which hath made them drunk hath made me bold; what hath quench’d them hath given me fire. Hark! Peace!' },
          { speaker: 'MACBETH', text: 'I have done the deed. Didst thou not hear a noise?' },
          { speaker: 'LADY MACBETH', text: 'I heard the owl scream and the crickets cry. Did not you speak?' },
          { speaker: 'MACBETH', text: 'When?' },
          { speaker: 'LADY MACBETH', text: 'Now.' },
          { speaker: 'MACBETH', text: 'As I descended?' },
          { speaker: 'LADY MACBETH', text: 'Ay.' },
          { speaker: 'MACBETH', text: 'Hark! Who lies i’ the second chamber?' },
          { speaker: 'LADY MACBETH', text: 'Donalbain.' },
          { speaker: 'MACBETH', text: 'This is a sorry sight.' },
          { speaker: 'LADY MACBETH', text: 'A foolish thought, to say a sorry sight.' },
          { speaker: 'MACBETH', text: 'Methought I heard a voice cry "Sleep no more! Macbeth does murder sleep"—the innocent sleep, sleep that knits up the ravell’d sleave of care, the death of each day’s life, sore labour’s bath, balm of hurt minds, great nature’s second course.' },
          { speaker: 'LADY MACBETH', text: 'What do you mean?' },
          { speaker: 'MACBETH', text: 'Still it cried "Sleep no more!" to all the house: "Glamis hath murder’d sleep, and therefore Cawdor shall sleep no more; Macbeth shall sleep no more."' },
          { speaker: 'LADY MACBETH', text: 'Go get some water, and wash this filthy witness from your hand. Why did you bring these daggers from the place? They must lie there: go carry them; and smear the sleepy grooms with blood.' },
          { speaker: 'MACBETH', text: 'I’ll go no more: I am afraid to think what I have done; look on’t again I dare not.' },
          { speaker: 'LADY MACBETH', text: 'Infirm of purpose! Give me the daggers: the sleeping and the dead are but as pictures: ’tis the eye of childhood that fears a painted devil.' }
        ]
      }
    ]
  },
  {
    id: 'shake-romeo-juliet',
    title: 'Romeo and Juliet',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1595',
    genre: 'Tragedy',
    summary: 'Two young star-crossed lovers in feuding Verona risk everything for love.',
    scenes: [
      {
        id: 'act2-sc2',
        title: 'Act II, Scene 2 — Capulet’s Orchard (The Balcony Scene)',
        lines: [
          { speaker: 'ROMEO', text: 'He jests at scars that never felt a wound. But, soft! What light through yonder window breaks? It is the east, and Juliet is the sun. Arise, fair sun, and kill the envious moon, who is already sick and pale with grief, that thou her maid art far more fair than she.' },
          { speaker: 'JULIET', text: 'Ay me!' },
          { speaker: 'ROMEO', text: 'She speaks: O, speak again, bright angel! For thou art as glorious to this night, being o’er my head, as is a winged messenger of heaven.' },
          { speaker: 'JULIET', text: 'O Romeo, Romeo! Wherefore art thou Romeo? Deny thy father and refuse thy name; or, if thou wilt not, be but sworn my love, and I’ll no longer be a Capulet.' },
          { speaker: 'ROMEO', direction: 'Aside', text: 'Shall I hear more, or shall I speak at this?' },
          { speaker: 'JULIET', text: '’Tis but thy name that is my enemy; thou art thyself, though not a Montague. What’s Montague? It is nor hand, nor foot, nor arm, nor face, nor any other part belonging to a man. O, be some other name! What’s in a name? That which we call a rose by any other name would smell as sweet.' },
          { speaker: 'ROMEO', text: 'I take thee at thy word: call me but love, and I’ll be new baptized; henceforth I never will be Romeo.' },
          { speaker: 'JULIET', text: 'What man art thou that thus bescreen’d in night so stumblest on my counsel?' },
          { speaker: 'ROMEO', text: 'By a name I know not how to tell thee who I am: my name, dear saint, is hateful to myself, because it is an enemy to thee; had I it written, I would tear the word.' },
          { speaker: 'JULIET', text: 'My ears have not yet drunk a hundred words of that tongue’s utterance, yet I know the sound: art thou not Romeo and a Montague?' },
          { speaker: 'ROMEO', text: 'Neither, fair saint, if either thee dislike.' },
          { speaker: 'JULIET', text: 'How camest thou hither, tell me, and wherefore? The orchard walls are high and hard to climb, and the place death, considering who thou art, if any of my kinsmen find thee here.' },
          { speaker: 'ROMEO', text: 'With love’s light wings did I o’er-perch these walls; for stony limits cannot hold love out, and what love can do that dares love attempt; therefore thy kinsmen are no let to me.' },
          { speaker: 'JULIET', text: 'If they do see thee, they will murder thee.' },
          { speaker: 'ROMEO', text: 'Alack, there lies more peril in thine eye than twenty of their swords: look thou but sweet, and I am proof against their enmity.' }
        ]
      },
      {
        id: 'act1-sc4',
        title: 'Act I, Scene 4 — Mercutio’s Queen Mab Speech',
        lines: [
          { speaker: 'ROMEO', text: 'Give me a torch: I am not for this ambling; being but heavy, I will bear the light.' },
          { speaker: 'MERCUTIO', text: 'Nay, gentle Romeo, we must have you dance.' },
          { speaker: 'ROMEO', text: 'Not I, believe me: you have dancing shoes with nimble soles: I have a soul of lead so stakes me to the ground I cannot move.' },
          { speaker: 'MERCUTIO', text: 'You are a lover; borrow Cupid’s wings, and soar with them above a common bound.' },
          { speaker: 'ROMEO', text: 'I dreamt a dream to-night.' },
          { speaker: 'MERCUTIO', text: 'And so did I.' },
          { speaker: 'ROMEO', text: 'Well, what was yours?' },
          { speaker: 'MERCUTIO', text: 'That dreamers often lie.' },
          { speaker: 'ROMEO', text: 'In bed asleep, while they do dream things true.' },
          { speaker: 'MERCUTIO', text: 'O, then, I see Queen Mab hath been with you. She is the fairies’ midwife, and she comes in shape no bigger than an agate-stone on the fore-finger of an alderman, drawn with a team of little atomies athwart men’s noses as they lie asleep.' },
          { speaker: 'ROMEO', text: 'Peace, peace, Mercutio, peace! Thou talk’st of nothing.' },
          { speaker: 'MERCUTIO', text: 'True, I talk of dreams, which are the children of an idle brain, begot of nothing but vain fantasy, which is as thin of substance as the air and more inconstant than the wind.' }
        ]
      }
    ]
  },
  {
    id: 'shake-midsummer',
    title: 'A Midsummer Night’s Dream',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1595',
    genre: 'Comedy',
    summary: 'Lovers, mechanicals, and feuding fairy royals collide in an enchanted Athenian forest.',
    scenes: [
      {
        id: 'act2-sc1',
        title: 'Act II, Scene 1 — Oberon, Titania & Puck in the Wood',
        lines: [
          { speaker: 'OBERON', text: 'Ill met by moonlight, proud Titania.' },
          { speaker: 'TITANIA', text: 'What, jealous Oberon! Fairies, skip hence: I have forsworn his bed and company.' },
          { speaker: 'OBERON', text: 'Tarry, rash wanton: am not I thy lord?' },
          { speaker: 'TITANIA', text: 'Then I must be thy lady: why art thou here, come from the farthest Steppe of India, but that, forsooth, the bouncing Amazon, your buskin’d mistress and your warrior love, to Theseus must be wedded?' },
          { speaker: 'OBERON', text: 'How canst thou thus for shame, Titania, glance at my credit with Hippolyta, knowing I know thy love to Theseus?' },
          { speaker: 'TITANIA', text: 'These are the forgeries of jealousy: and never, since the middle summer’s spring, met we on hill, in dale, forest or mead, but with thy brawls thou hast disturb’d our sport.' },
          { speaker: 'OBERON', text: 'Do you amend it then; it lies in you: why should Titania cross her Oberon? I do but beg a little changeling boy, to be my henchman.' },
          { speaker: 'TITANIA', text: 'Set your heart at rest: the fairy land buys not the child of me. His mother was a votaress of my order, and for her sake do I rear up her boy, and for her sake I will not part with him.' },
          { speaker: 'OBERON', text: 'How long within this wood intend you stay?' },
          { speaker: 'TITANIA', text: 'Perchance till after Theseus’ wedding-day. If you will patiently dance in our round and see our moonlight revels, go with us; if not, shun me, and I will spare your haunts.' },
          { speaker: 'OBERON', text: 'Give me that boy, and I will go with thee.' },
          { speaker: 'TITANIA', text: 'Not for thy fairy kingdom. Fairies, away!' },
          { speaker: 'OBERON', text: 'Well, go thy way: thou shalt not from this grove till I torment thee for this injury. My gentle Puck, come hither.' },
          { speaker: 'PUCK', text: 'I’ll put a girdle round about the earth in forty minutes.' }
        ]
      },
      {
        id: 'act3-sc2',
        title: 'Act III, Scene 2 — Helena, Hermia, Lysander & Demetrius',
        lines: [
          { speaker: 'LYSANDER', text: 'Why should you think that I should woo in scorn? Scorn and derision never come in tears: look, when I vow, I weep; and vows so born, in their nativity all truth appears.' },
          { speaker: 'HELENA', text: 'You do advance your cunning more and more. When truth kills truth, O devilish-holy fray! These vows are Hermia’s: will you give her o’er?' },
          { speaker: 'DEMETRIUS', text: 'O Helen, goddess, nymph, perfect, divine! To what, my love, shall I compare thine eyne? Crystal is muddy.' },
          { speaker: 'HELENA', text: 'O spite! O hell! I see you all are bent to set against me for your merriment: if you were civil and knew courtesy, you would not do me thus much injury.' },
          { speaker: 'HERMIA', text: 'Helena, what is’t you mean?' },
          { speaker: 'HELENA', text: 'Lo, she is one of this confederacy! Now I perceive they have conjoin’d all three to fashion this false sport, in spite of me. Injurious Hermia! Most ungrateful maid!' },
          { speaker: 'HERMIA', text: 'I am amazed at your passionate words. I scorn you not: it seems that you scorn me.' }
        ]
      }
    ]
  },
  {
    id: 'shake-othello',
    title: 'Othello',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1604',
    genre: 'Tragedy',
    summary: 'In Venice and Cyprus, the Moorish general Othello is poisoned by the scheming ensign Iago into doubting Desdemona.',
    scenes: [
      {
        id: 'act3-sc3',
        title: 'Act III, Scene 3 — "O, beware, my lord, of jealousy"',
        lines: [
          { speaker: 'IAGO', text: 'My noble lord—' },
          { speaker: 'OTHELLO', text: 'What dost thou say, Iago?' },
          { speaker: 'IAGO', text: 'Did Michael Cassio, when you woo’d my lady, know of your love?' },
          { speaker: 'OTHELLO', text: 'He did, from first to last: why dost thou ask?' },
          { speaker: 'IAGO', text: 'But for a satisfaction of my thought; no further harm.' },
          { speaker: 'OTHELLO', text: 'Why of thy thought, Iago?' },
          { speaker: 'IAGO', text: 'I did not think he had been acquainted with her.' },
          { speaker: 'OTHELLO', text: 'O, yes; and went between us very oft.' },
          { speaker: 'IAGO', text: 'Indeed!' },
          { speaker: 'OTHELLO', text: 'Indeed! Ay, indeed: discern’st thou aught in that? Is he not honest?' },
          { speaker: 'IAGO', text: 'Honest, my lord!' },
          { speaker: 'OTHELLO', text: 'Honest! Ay, honest.' },
          { speaker: 'IAGO', text: 'My lord, for aught I know.' },
          { speaker: 'OTHELLO', text: 'What dost thou think?' },
          { speaker: 'IAGO', text: 'Think, my lord!' },
          { speaker: 'OTHELLO', text: 'Think, my lord! By heaven, he echoes me, as if there were some monster in his thought too hideous to be shown. Thou dost mean something: I heard thee say even now, thou likedst not that, when Cassio left my wife: what didst not like?' },
          { speaker: 'IAGO', text: 'Good name in man and woman, dear my lord, is the immediate jewel of their souls: who steals my purse steals trash; ’tis something, nothing; ’twas mine, ’tis his, and has been slave to thousands; but he that filches from me my good name robs me of that which not enriches him and makes me poor indeed.' },
          { speaker: 'OTHELLO', text: 'By heaven, I’ll know thy thoughts.' },
          { speaker: 'IAGO', text: 'O, beware, my lord, of jealousy; it is the green-eyed monster which doth mock the meat it feeds on.' }
        ]
      }
    ]
  },
  {
    id: 'shake-king-lear',
    title: 'King Lear',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1605',
    genre: 'Tragedy',
    summary: 'An aging monarch divides his kingdom by flattering declarations of love, banishing his truest daughter.',
    scenes: [
      {
        id: 'act1-sc1',
        title: 'Act I, Scene 1 — The Division of the Kingdom',
        lines: [
          { speaker: 'LEAR', text: 'Meantime we shall express our darker purpose. Tell me, my daughters, which of you shall we say doth love us most? That we our largest bounty may extend where nature doth with merit challenge. Goneril, our eldest-born, speak first.' },
          { speaker: 'GONERIL', text: 'Sir, I love you more than words can wield the matter; dearer than eye-sight, space, and liberty; beyond what can be valued, rich or rare; a love that makes breath poor, and speech unable.' },
          { speaker: 'CORDELIA', direction: 'Aside', text: 'What shall Cordelia do? Love, and be silent.' },
          { speaker: 'LEAR', text: 'What says our second daughter, our dearest Regan, wife to Cornwall? Speak.' },
          { speaker: 'REGAN', text: 'I am made of that self metal as my sister, and prize me at her worth. In my true heart I find she names my very deed of love; only she comes too short.' },
          { speaker: 'CORDELIA', direction: 'Aside', text: 'Then poor Cordelia! And yet not so; since, I am sure, my love’s more ponderous than my tongue.' },
          { speaker: 'LEAR', text: 'Now, our joy, although the last, not least; what can you say to draw a third more opulent than your sisters? Speak.' },
          { speaker: 'CORDELIA', text: 'Nothing, my lord.' },
          { speaker: 'LEAR', text: 'Nothing!' },
          { speaker: 'CORDELIA', text: 'Nothing.' },
          { speaker: 'LEAR', text: 'Nothing will come of nothing: speak again.' },
          { speaker: 'CORDELIA', text: 'Unhappy that I am, I cannot heave my heart into my mouth: I love your majesty according to my bond; nor more nor less.' },
          { speaker: 'LEAR', text: 'How, how, Cordelia! Mend your speech a little, lest it may mar your fortunes.' },
          { speaker: 'CORDELIA', text: 'Good my lord, you have begot me, bred me, loved me: I return those duties back as are right fit, obey you, love you, and most honour you. Why have my sisters husbands, if they say they love you all?' },
          { speaker: 'LEAR', text: 'But goes thy heart with this?' },
          { speaker: 'CORDELIA', text: 'Ay, good my lord.' },
          { speaker: 'LEAR', text: 'So young, and so untender?' },
          { speaker: 'CORDELIA', text: 'So young, my lord, and true.' }
        ]
      }
    ]
  },
  {
    id: 'shake-tempest',
    title: 'The Tempest',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1611',
    genre: 'Romance / Comedy',
    summary: 'Exiled on an enchanted island, the sorcerer Prospero conjures a storm to confront those who wronged him.',
    scenes: [
      {
        id: 'act1-sc2',
        title: 'Act I, Scene 2 — Prospero, Miranda & Ariel',
        lines: [
          { speaker: 'MIRANDA', text: 'If by your art, my dearest father, you have put the wild waters in this roar, allay them. O, I have suffered with those that I saw suffer: a brave vessel, who had, no doubt, some noble creature in her, dash’d all to pieces.' },
          { speaker: 'PROSPERO', text: 'Be collected: no more amazement: tell your piteous heart there’s no harm done.' },
          { speaker: 'MIRANDA', text: 'O, woe the day!' },
          { speaker: 'PROSPERO', text: 'No harm. I have done nothing but in care of thee, of thee, my dear one, thee, my daughter, who art ignorant of what thou art, nought knowing of whence I am, nor that I am more better than Prospero, master of a full poor cell, and thy no greater father.' },
          { speaker: 'MIRANDA', text: 'More to know did never meddle with my thoughts.' },
          { speaker: 'PROSPERO', text: '’Tis time I should inform thee farther. Twelve year since, Miranda, twelve year since, thy father was the Duke of Milan and a prince of power.' },
          { speaker: 'MIRANDA', text: 'Sir, are not you my father?' },
          { speaker: 'PROSPERO', text: 'Thy mother was a piece of virtue, and she said thou wast my daughter; and thy father was Duke of Milan; and stress of fortune brought us to this shore.' },
          { speaker: 'ARIEL', direction: 'Entering', text: 'All hail, great master! Grave sir, hail! I come to answer thy best pleasure; be’t to fly, to swim, to dive into the fire, to ride on the curl’d clouds, to thy strong bidding task Ariel and all his quality.' },
          { speaker: 'PROSPERO', text: 'Hast thou, spirit, perform’d to point the tempest that I bade thee?' },
          { speaker: 'ARIEL', text: 'To every article. Not a hair perish’d; on their sustaining garments not a blemish, but fresher than before.' }
        ]
      }
    ]
  },
  {
    id: 'shake-much-ado',
    title: 'Much Ado About Nothing',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1598',
    genre: 'Comedy',
    summary: 'Beatrice and Benedick wage a "merry war" of wits in Messina while schemes test young Hero and Claudio.',
    scenes: [
      {
        id: 'act1-sc1',
        title: 'Act I, Scene 1 — Beatrice & Benedick’s "Merry War"',
        lines: [
          { speaker: 'BEATRICE', text: 'I wonder that you will still be talking, Signior Benedick: nobody marks you.' },
          { speaker: 'BENEDICK', text: 'What, my dear Lady Disdain! Are you yet living?' },
          { speaker: 'BEATRICE', text: 'Is it possible disdain should die while she hath such meet food to feed it as Signior Benedick? Courtesy itself must convert to disdain, if you come in her presence.' },
          { speaker: 'BENEDICK', text: 'Then is courtesy a turncoat. But it is certain I am loved of all ladies, only you excepted: and I would I could find in my heart that I had not a hard heart; for, truly, I love none.' },
          { speaker: 'BEATRICE', text: 'A dear happiness to women: they would else have been troubled with a pernicious suitor. I thank God and my cold blood, I am of your humour for that: I had rather hear my dog bark at a crow than a man swear he loves me.' },
          { speaker: 'BENEDICK', text: 'God keep your ladyship still in that mind! So some gentleman or other shall ’scape a predestinate scratched face.' },
          { speaker: 'BEATRICE', text: 'Scratching could not make it worse, an ’twere such a face as yours were.' },
          { speaker: 'BENEDICK', text: 'Well, you are a rare parrot-teacher.' },
          { speaker: 'BEATRICE', text: 'A bird of my tongue is better than a beast of yours.' },
          { speaker: 'BENEDICK', text: 'I would my horse had the speed of your tongue, and so good a continuer. But keep your way, i’ God’s name; I have done.' },
          { speaker: 'BEATRICE', text: 'You always end with a jade’s trick: I know you of old.' }
        ]
      }
    ]
  },
  {
    id: 'shake-twelfth-night',
    title: 'Twelfth Night',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1601',
    genre: 'Comedy',
    summary: 'Shipwrecked in Illyria, Viola disguises herself as the page Cesario and falls into a tangled love triangle.',
    scenes: [
      {
        id: 'act1-sc5',
        title: 'Act I, Scene 5 — The Willow Cabin Speech (Viola & Olivia)',
        lines: [
          { speaker: 'OLIVIA', text: 'Give us the place alone: we will hear this divinity. Now, sir, what is your text?' },
          { speaker: 'VIOLA', text: 'Most sweet lady—' },
          { speaker: 'OLIVIA', text: 'A comfortable doctrine, and much may be said of it. Where lies your text?' },
          { speaker: 'VIOLA', text: 'In Orsino’s bosom.' },
          { speaker: 'OLIVIA', text: 'In his bosom! In what chapter of his bosom?' },
          { speaker: 'VIOLA', text: 'To answer by the method, in the first of his heart.' },
          { speaker: 'OLIVIA', text: 'O, I have read it: it is heresy. Have you no more to say?' },
          { speaker: 'VIOLA', text: 'Good madam, let me see your face.' },
          { speaker: 'OLIVIA', text: 'Have you any commission from your lord to negotiate with my face? You are now out of your text: but we will draw the curtain and show you the picture. Look you, sir, such a one I was this present: is’t not well done?' },
          { speaker: 'VIOLA', text: 'Excellently done, if God did all.' },
          { speaker: 'OLIVIA', text: '’Tis in grain, sir; ’twill endure wind and weather.' },
          { speaker: 'VIOLA', text: '’Tis beauty truly blent, whose red and white nature’s own sweet and cunning hand laid on: lady, you are the cruell’st she alive, if you will lead these graces to the grave and leave the world no copy.' },
          { speaker: 'OLIVIA', text: 'Why, what would you?' },
          { speaker: 'VIOLA', text: 'Make me a willow cabin at your gate, and call upon my soul within the house; write loyal cantons of contemned love and sing them loud even in the dead of night; halloo your name to the reverberate hills and make the babbling gossip of the air cry out "Olivia!"' },
          { speaker: 'OLIVIA', text: 'You might do much. What is your parentage?' },
          { speaker: 'VIOLA', text: 'Above my fortunes, yet my state is well: I am a gentleman.' }
        ]
      }
    ]
  },
  {
    id: 'shake-julius-caesar',
    title: 'Julius Caesar',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1599',
    genre: 'Tragedy',
    summary: 'Roman senators conspire to assassinate Julius Caesar to save the Republic, unleashing civil war.',
    scenes: [
      {
        id: 'act1-sc2',
        title: 'Act I, Scene 2 — Cassius & Brutus ("The fault, dear Brutus, is not in our stars")',
        lines: [
          { speaker: 'CASSIUS', text: 'Brutus, I do observe you now of late: I have not from your eyes that gentleness and show of love as I was wont to have.' },
          { speaker: 'BRUTUS', text: 'Cassius, be not deceived: if I have veil’d my look, I turn the trouble of my countenance merely upon myself. Vexed I am of late with passions of some difference.' },
          { speaker: 'CASSIUS', text: 'Tell me, good Brutus, can you see your face?' },
          { speaker: 'BRUTUS', text: 'No, Cassius; for the eye sees not itself, but by reflection, by some other things.' },
          { speaker: 'CASSIUS', text: '’Tis just: and it is very much lamented, Brutus, that you have no such mirrors as will turn your hidden worthiness into your eye, that you might see your shadow.' },
          { speaker: 'BRUTUS', text: 'Into what dangers would you lead me, Cassius, that you would have me seek into myself for that which is not in me?' },
          { speaker: 'CASSIUS', text: 'Why, man, he doth bestride the narrow world like a Colossus, and we petty men walk under his huge legs and peep about to find ourselves dishonourable graves. Men at some time are masters of their fates: the fault, dear Brutus, is not in our stars, but in ourselves, that we are underlings.' },
          { speaker: 'BRUTUS', text: 'That you do love me, I am nothing jealous; what you would work me to, I have some aim: how I have thought of this and of these times, I shall recount hereafter.' }
        ]
      }
    ]
  },
  {
    id: 'shake-as-you-like-it',
    title: 'As You Like It',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1599',
    genre: 'Comedy',
    summary: 'Banished to the Forest of Arden, Rosalind disguises herself as Ganymede to tutor her lovesick suitor Orlando.',
    scenes: [
      {
        id: 'act3-sc2',
        title: 'Act III, Scene 2 — Rosalind & Orlando in the Forest of Arden',
        lines: [
          { speaker: 'ROSALIND', text: 'Do you hear, forester?' },
          { speaker: 'ORLANDO', text: 'Very well: what would you?' },
          { speaker: 'ROSALIND', text: 'I pray you, what is’t o’clock?' },
          { speaker: 'ORLANDO', text: 'You should ask me what time o’ day: there’s no clock in the forest.' },
          { speaker: 'ROSALIND', text: 'Then there is no true lover in the forest; else sighing every minute and groaning every hour would detect the lazy foot of Time as well as a clock.' },
          { speaker: 'ORLANDO', text: 'And why not the swift foot of Time? Had not that been as proper?' },
          { speaker: 'ROSALIND', text: 'By no means, sir: Time travels in divers paces with divers persons. There is a man haunts the forest, that abuses our young plants with carving "Rosalind" on their barks.' },
          { speaker: 'ORLANDO', text: 'I am he that is so love-shaked: I pray you tell me your remedy.' },
          { speaker: 'ROSALIND', text: 'Love is merely a madness, and, I tell you, deserves as well a dark house and a whip as madmen do. Yet I profess curing it by counsel.' },
          { speaker: 'ORLANDO', text: 'Did you ever cure any so?' },
          { speaker: 'ROSALIND', text: 'Yes, one, and in this manner. He was to imagine me his love, his mistress; and I set him every day to woo me: at which time would I, being but a moonish youth, grieve, be effeminate, changeable, longing and liking; and would now like him, now loathe him; and now I will be your Rosalind in a more coming-on disposition, and ask me what you will, I will grant it.' },
          { speaker: 'ORLANDO', text: 'Then love me, Rosalind.' },
          { speaker: 'ROSALIND', text: 'Yes, faith, will I, Fridays and Saturdays and all.' }
        ]
      }
    ]
  },
  {
    id: 'shake-merchant-venice',
    title: 'The Merchant of Venice',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1596',
    genre: 'Comedy / Drama',
    summary: 'A Venetian merchant defaults on a loan from Shylock, bringing Portia in disguise to the courtroom.',
    scenes: [
      {
        id: 'act4-sc1',
        title: 'Act IV, Scene 1 — The Courtroom ("The quality of mercy is not strain’d")',
        lines: [
          { speaker: 'PORTIA', text: 'Which is the merchant here, and which the Jew?' },
          { speaker: 'DUKE', text: 'Antonio and old Shylock, both stand forth.' },
          { speaker: 'PORTIA', text: 'Is your name Shylock?' },
          { speaker: 'SHYLOCK', text: 'Shylock is my name.' },
          { speaker: 'PORTIA', text: 'Of a strange nature is the suit you follow; yet in such rule that the Venetian law cannot impugn you as you do proceed. Do you confess the bond?' },
          { speaker: 'ANTONIO', text: 'I do.' },
          { speaker: 'PORTIA', text: 'Then must the Jew be merciful.' },
          { speaker: 'SHYLOCK', text: 'On what compulsion must I? Tell me that.' },
          { speaker: 'PORTIA', text: 'The quality of mercy is not strain’d, it droppeth as the gentle rain from heaven upon the place beneath: it is twice blest; it blesseth him that gives and him that takes: ’tis mightiest in the mightiest: it becomes the throned monarch better than his crown.' },
          { speaker: 'SHYLOCK', text: 'My deeds upon my head! I crave the law, the penalty and forfeit of my bond.' },
          { speaker: 'PORTIA', text: 'Is he not able to discharge the money?' },
          { speaker: 'BASSANIO', text: 'Yes, here I tender it for him in the court; yea, twice the sum.' },
          { speaker: 'PORTIA', text: 'Tarry a little; there is something else. This bond doth give thee here no jot of blood; the words expressly are "a pound of flesh": take then thy bond, take thou thy pound of flesh; but, in the cutting it, if thou dost shed one drop of Christian blood, thy lands and goods are, by the laws of Venice, confiscate unto the state of Venice.' }
        ]
      }
    ]
  },
  {
    id: 'shake-taming-shrew',
    title: 'The Taming of the Shrew',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1592',
    genre: 'Comedy',
    summary: 'In Padua, the sharp-tongued Katherina and the brazen fortune-seeker Petruchio spar in an explosive courtship.',
    scenes: [
      {
        id: 'act2-sc1',
        title: 'Act II, Scene 1 — Petruchio & Katherina’s First Encounter',
        lines: [
          { speaker: 'PETRUCHIO', text: 'Good morrow, Kate; for that’s your name, I hear.' },
          { speaker: 'KATHERINA', text: 'Well have you heard, but something hard of hearing: they call me Katherine that do talk of me.' },
          { speaker: 'PETRUCHIO', text: 'You lie, in faith; for you are call’d plain Kate, and bonny Kate, and sometimes Kate the curst; but, Kate, the prettiest Kate in Christendom, hearing thy mildness praised in every town, myself am moved to woo thee for my wife.' },
          { speaker: 'KATHERINA', text: 'Moved! In good time: let him that moved you hither remove you hence: I knew you at the first you were a moveable.' },
          { speaker: 'PETRUCHIO', text: 'Why, what’s a moveable?' },
          { speaker: 'KATHERINA', text: 'A join’d-stool.' },
          { speaker: 'PETRUCHIO', text: 'Thou hast hit it: come, sit on me.' },
          { speaker: 'KATHERINA', text: 'Asses are made to bear, and so are you.' },
          { speaker: 'PETRUCHIO', text: 'Come, come, you wasp; i’ faith, you are too angry.' },
          { speaker: 'KATHERINA', text: 'If I be waspish, best beware my sting.' },
          { speaker: 'PETRUCHIO', text: 'My remedy is then, to pluck it out.' },
          { speaker: 'KATHERINA', text: 'Ay, if the fool could find it where it lies.' },
          { speaker: 'PETRUCHIO', text: 'Who knows not where a wasp doth wear his sting? In his tail.' },
          { speaker: 'KATHERINA', text: 'In his tongue.' },
          { speaker: 'PETRUCHIO', text: 'Whose tongue?' },
          { speaker: 'KATHERINA', text: 'Yours, if you talk of tails: and so farewell.' }
        ]
      }
    ]
  },
  {
    id: 'shake-antony-cleopatra',
    title: 'Antony and Cleopatra',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1607',
    genre: 'Tragedy',
    summary: 'Mark Antony and Cleopatra’s grand passion shakes the foundations of the Roman Empire and Egypt.',
    scenes: [
      {
        id: 'act1-sc1',
        title: 'Act I, Scene 1 — "If it be love indeed, tell me how much"',
        lines: [
          { speaker: 'CLEOPATRA', text: 'If it be love indeed, tell me how much.' },
          { speaker: 'ANTONY', text: 'There’s beggary in the love that can be reckon’d.' },
          { speaker: 'CLEOPATRA', text: 'I’ll set a bourn how far to be beloved.' },
          { speaker: 'ANTONY', text: 'Then must thou needs find out new heaven, new earth.' },
          { speaker: 'CLEOPATRA', text: 'Hear the ambassadors. Perchance, nay, and most like, you must not stay here longer, your dismission is come from Caesar.' },
          { speaker: 'ANTONY', text: 'Let Rome in Tiber melt, and the wide arch of the ranged empire fall! Here is my space. Kingdoms are clay: our dungy earth alike feeds beast as man: the nobleness of life is to do thus.' },
          { speaker: 'CLEOPATRA', text: 'Excellent falsehood! Why did he marry Fulvia, and not love her? I’ll seem the fool I am not; Antony will be himself.' },
          { speaker: 'ANTONY', text: 'But stirr’d by Cleopatra. Now, for the love of Love and her soft hours, let’s not confound the time with conference harsh.' }
        ]
      }
    ]
  },
  {
    id: 'shake-winters-tale',
    title: 'The Winter’s Tale',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1611',
    genre: 'Romance',
    summary: 'King Leontes’ sudden jealousy destroys his family until time, Bohemia’s shepherds, and a living statue bring redemption.',
    scenes: [
      {
        id: 'act3-sc2',
        title: 'Act III, Scene 2 — Hermione’s Trial & Paulina’s Rebuke',
        lines: [
          { speaker: 'LEONTES', text: 'Read the indictment.' },
          { speaker: 'HERMIONE', text: 'Since what I am to say must be but that which contradicts my accusation, and the testimony on my part no other but what comes from myself, it shall scarce boot me to say "not guilty." Yet, if powers divine behold our human actions, as they do, I doubt not then but innocence shall make false accusation blush.' },
          { speaker: 'LEONTES', text: 'You will not own it.' },
          { speaker: 'HERMIONE', text: 'More than mistress of which comes to me in name of fault, I must not at all acknowledge. Sir, spare your threats: the bug which you would fright me with I seek. To me can life be no commodity.' },
          { speaker: 'PAULINA', text: 'Woe the while! O, cut my lace, lest my heart, cracking it, break too! What studied torments, tyrant, hast for me? The queen, the sweet’st, dear’st creature’s dead, and vengeance for’t not dropp’d down yet.' },
          { speaker: 'LEONTES', text: 'Apollo’s angry; and the heavens themselves do strike at my injustice.' }
        ]
      }
    ]
  },
  {
    id: 'shake-measure-for-measure',
    title: 'Measure for Measure',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1604',
    genre: 'Problem Comedy',
    summary: 'In Vienna, the novice nun Isabella pleads with the puritanical deputy Angelo for her brother’s life.',
    scenes: [
      {
        id: 'act2-sc2',
        title: 'Act II, Scene 2 — Isabella & Angelo ("To whom should I complain?")',
        lines: [
          { speaker: 'ISABELLA', text: 'I am a woeful suitor to your honour, please but your honour hear me.' },
          { speaker: 'ANGELO', text: 'Well; what’s your suit?' },
          { speaker: 'ISABELLA', text: 'There is a vice that most I do abhor, and most desire should meet the blow of justice; for which I would not plead, but that I must. I have a brother is condemn’d to die: I do beseech you, let it be his fault, and not my brother.' },
          { speaker: 'ANGELO', text: 'Condemn the fault and not the actor of it? Why, every fault’s condemn’d ere it be done: mine were the very cipher of a function, to fine the faults whose fine stands in record, and let go by the actor.' },
          { speaker: 'ISABELLA', text: 'O just but severe law! Might there not be a charity in sin to save this brother’s life?' },
          { speaker: 'ANGELO', text: 'Ha! Fie, these filthy vices! What would you do?' },
          { speaker: 'ISABELLA', text: 'As much for my poor brother as myself: that is, were I under the terms of death, the impression of keen whips I’d wear as rubies, and strip myself to death, as to a bed that longing have been sick for, ere I’d yield my body up to shame.' },
          { speaker: 'ANGELO', text: 'Then must your brother die.' },
          { speaker: 'ISABELLA', text: 'And ’twere the cheaper way: better it were a brother died at once, than that a sister, by redeeming him, should die for ever. To whom should I complain? Did I tell this, who would believe me?' }
        ]
      }
    ]
  },
  {
    id: 'shake-richard-iii',
    title: 'Richard III',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1593',
    genre: 'Tragedy / History',
    summary: 'Richard, Duke of Gloucester, plots, charms, and murders his way to the English throne.',
    scenes: [
      {
        id: 'act1-sc2',
        title: 'Act I, Scene 2 — "Now is the winter of our discontent" & Wooing Lady Anne',
        lines: [
          { speaker: 'RICHARD', text: 'Now is the winter of our discontent made glorious summer by this sun of York; and all the clouds that lour’d upon our house in the deep bosom of the ocean buried. And therefore, since I cannot prove a lover, to entertain these fair well-spoken days, I am determined to prove a villain.' },
          { speaker: 'LADY ANNE', text: 'Avaunt, thou dreadful minister of hell! Thou hadst but power over his mortal body, his soul thou canst not have; therefore be gone.' },
          { speaker: 'RICHARD', text: 'Sweet saint, for charity, be not so curst.' },
          { speaker: 'LADY ANNE', text: 'Foul devil, for God’s sake, hence, and trouble us not; for thou hast made the happy earth thy hell.' },
          { speaker: 'RICHARD', text: 'Lady, you know no rules of charity, which renders good for bad, blessings for curses.' },
          { speaker: 'LADY ANNE', text: 'Villain, thou know’st no law of God nor man: no beast so fierce but knows some touch of pity.' },
          { speaker: 'RICHARD', text: 'But I know none, and therefore am no beast.' },
          { speaker: 'LADY ANNE', text: 'O wonderful, when devils tell the truth!' },
          { speaker: 'RICHARD', text: 'More wonderful, when angels are so angry. Vouchsafe, divine perfection of a woman, of these supposed evils, to give me leave, by circumstance, but to acquit myself.' },
          { speaker: 'LADY ANNE', text: 'Didst thou not kill this king?' },
          { speaker: 'RICHARD', text: 'I grant ye.' },
          { speaker: 'LADY ANNE', text: 'O, he was gentle, mild, and virtuous!' },
          { speaker: 'RICHARD', text: 'The fitter for the King of heaven, that hath him. Your beauty was the cause of that effect; your beauty, which did haunt me in my sleep to undertake the death of all the world, so I might live one hour in your sweet bosom.' }
        ]
      }
    ]
  },
  {
    id: 'shake-coriolanus',
    title: 'Coriolanus',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1608',
    genre: 'Tragedy',
    summary: 'The proud Roman general Caius Martius Coriolanus scorns popular politics, is banished, and marches on Rome.',
    scenes: [
      {
        id: 'act5-sc3',
        title: 'Act V, Scene 3 — Volumnia Pleads with Coriolanus Before Rome',
        lines: [
          { speaker: 'CORIOLANUS', text: 'My wife comes foremost; then the honour’d mould wherein this trunk was framed, and in her hand the grandchild to her blood. But, out, affection! All bond and privilege of nature, break!' },
          { speaker: 'VOLUMNIA', text: 'Should we be silent and not speak, our raiment and state of bodies would bewray what life we have led since thy exile. Think with thyself how more unfortunate than all living women are we come hither.' },
          { speaker: 'CORIOLANUS', text: 'I beseech you, peace: or, if you’d ask, remember this before: the things I have forsworn to grant may never be held by you denials.' },
          { speaker: 'VOLUMNIA', text: 'Thou shalt no sooner march to assault thy country than to tread—trust to’t, thou shalt not—on thy mother’s womb, that brought thee into this world.' },
          { speaker: 'CORIOLANUS', text: 'O mother, mother! What have you done? Behold, the heavens do ope, the gods look down, and this unnatural scene they laugh at. O my mother, mother! O! You have won a happy victory to Rome; but, for your son—believe it, O, believe it—most dangerously you have with him prevail’d.' }
        ]
      }
    ]
  },
  {
    id: 'shake-comedy-errors',
    title: 'The Comedy of Errors',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1594',
    genre: 'Comedy',
    summary: 'Two sets of identical twins separated at birth unknowingly converge in Ephesus in a whirlwind of mistaken identity.',
    scenes: [
      {
        id: 'act2-sc2',
        title: 'Act II, Scene 2 — Antipholus, Dromio & Adriana',
        lines: [
          { speaker: 'ANTIPHOLUS', text: 'The gold I gave to Dromio is laid up safe at the Centaur; and the heedful slave is wander’d forth, in care to seek me out. Look, here he comes.' },
          { speaker: 'DROMIO', text: 'What, are you merry, sir? Why, what should a man do but be merry?' },
          { speaker: 'ANTIPHOLUS', text: 'Wait, tell me first, where hast thou left the gold?' },
          { speaker: 'DROMIO', text: 'What gold, sir? I had none of you.' },
          { speaker: 'ADRIANA', text: 'Ay, ay, Antipholus, look strange and frown: some other mistress hath thy sweet aspects; I am not Adriana nor thy wife. The time was once when thou unurged wouldst vow that never words were music to thine ear, that never object pleasing in thine eye, unless I spake, or look’d.' },
          { speaker: 'ANTIPHOLUS', text: 'Plead you to me, fair dame? I know you not: in Ephesus I am but two hours old, as strange unto your town as to your talk.' },
          { speaker: 'ADRIANA', text: 'Fie, brother! How the world is changed with you! Come, I will fasten on this sleeve of thine: thou art an elm, my husband, I a vine.' }
        ]
      }
    ]
  },
  {
    id: 'shake-loves-labours',
    title: 'Love’s Labour’s Lost',
    playwright: 'William Shakespeare',
    era: 'Elizabethan & Jacobean',
    year: '1595',
    genre: 'Comedy',
    summary: 'The King of Navarre and three companions swear off romance for three years of study—until the Princess of France arrives.',
    scenes: [
      {
        id: 'act2-sc1',
        title: 'Act II, Scene 1 — Berowne & Rosaline’s Battle of Wits',
        lines: [
          { speaker: 'BEROWNE', text: 'Did not I dance with you in Brabant once?' },
          { speaker: 'ROSALINE', text: 'Did not I dance with you in Brabant once?' },
          { speaker: 'BEROWNE', text: 'I know you did.' },
          { speaker: 'ROSALINE', text: 'How needless was it then to ask the question!' },
          { speaker: 'BEROWNE', text: 'You must not be so quick.' },
          { speaker: 'ROSALINE', text: '’Tis long of you that spur me with such questions.' },
          { speaker: 'BEROWNE', text: 'Your wit’s too hot, it speeds too fast, ’twill tire.' },
          { speaker: 'ROSALINE', text: 'Not till it leave the rider in the mire.' },
          { speaker: 'BEROWNE', text: 'What time o’ day?' },
          { speaker: 'ROSALINE', text: 'The hour that fools should ask.' },
          { speaker: 'BEROWNE', text: 'Now fair befall your mask!' },
          { speaker: 'ROSALINE', text: 'Fair fall the face it covers!' },
          { speaker: 'BEROWNE', text: 'And send you many lovers!' },
          { speaker: 'ROSALINE', text: 'Amen, so you be none.' },
          { speaker: 'BEROWNE', text: 'Nay, then will I be gone. And I, forsooth, in love! I, that have been love’s whip!' }
        ]
      }
    ]
  }
];
