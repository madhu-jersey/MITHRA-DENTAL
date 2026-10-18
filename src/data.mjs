// Site content. Everything here comes from the client brief or is a
// clearly marked placeholder. ALL MEDICAL COPY IS DRAFT and must be
// reviewed and approved by the clinic's dentists before publishing.

export const TBC = "To be confirmed with client";
export const RECOVERY_TBC = "To be confirmed by the doctor after assessment";

export const clinic = {
  name: "Sree Mithra Dental & Maxface Specialists",
  short: "Sree Mithra",
  tagline: "Dental & Maxface Specialists",
  addressLines: ["Sree Satya Plaza, Velpur Rd,", "opposite Masjid Complex, Venkatarayapuram,", "Tanuku, Andhra Pradesh 534211"],
  phoneDisplay: "088192 20055", // non-breaking space keeps the number on one line
  phoneHref: "tel:+918819220055",
  // Google Maps links live in src/reviews.json (directionsUrl, reviewsUrl)
  directions: "",
  reviewsUrl: "",
  domain: "[domain to be confirmed]",
};

export const doctors = [
  {
    id: "sriramu",
    // CONFIRM WITH CLIENT: the first signboard reads "Dr. S.R.S. Reddy, G.P.D.S. (OMFS)".
    // Showing one name only until the client confirms spelling and degrees.
    name: "Dr. G. Sriramu Subbareddy",
    degree: "M.D.S (OMFS)",
    specialty: "Oral & Maxillofacial Surgery",
    specialtyTbc: true,
    services: ["Maxillofacial surgery", "Facial trauma care", "Dental implants", "Surgical and wisdom tooth extraction"],
  },
  {
    id: "lakshmi",
    name: "Dr. G.V.N. Lakshmi",
    degree: "B.D.S.",
    specialty: "Specialty to be confirmed",
    specialtyTbc: true,
    services: ["General dental care", "Fillings and root canal treatment", "Cosmetic dental care", "Cleaning and check-ups"],
  },
];

export const services = [
  {
    slug: "dental",
    name: "Dental",
    icon: "tooth",
    sub: "General dental care for teeth and gums.",
    summary: "Check-ups, cleaning, fillings, root canal treatment and extractions for everyday dental problems.",
    points: ["Check-ups and professional cleaning", "Fillings and root canal treatment", "Extractions and wisdom teeth"],
    problems: [
      { icon: "bolt", t: "Toothache", d: "A constant or throbbing ache, often worse when chewing or at night." },
      { icon: "thermo", t: "Sensitivity to hot or cold", d: "A sharp twinge when you eat or drink something hot, cold or sweet." },
      { icon: "drop", t: "Bleeding gums", d: "Gums that bleed when you brush or floss, or look red and swollen." },
      { icon: "tooth", t: "Cavities", d: "Holes or dark spots in a tooth caused by decay." },
      { icon: "alert", t: "Wisdom tooth pain", d: "Pain or swelling at the back of the jaw as a wisdom tooth comes through." },
      { icon: "crack", t: "Broken or cracked teeth", d: "A chipped, cracked or broken tooth after biting or an injury." },
    ],
    why: [
      { t: "Tooth decay", d: "Bacteria in the mouth feed on sugar and produce acid. Over time the acid softens enamel and forms a cavity, which can reach the nerve and cause pain." },
      { t: "Gum inflammation", d: "Plaque that is not removed by brushing irritates the gums. They become red, swollen and bleed easily, and the inflammation can spread below the gum line." },
      { t: "Enamel wear", d: "Acidic food and drink, hard brushing and grinding wear the outer enamel away, exposing the more sensitive layer underneath." },
      { t: "Pressure or impact", d: "Biting on something hard, grinding at night or a knock to the mouth can crack or break a tooth." },
    ],
    causes: ["Sugary or acidic diet", "Poor brushing and flossing", "Skipped dental check-ups", "Grinding teeth at night", "Injury to the mouth", "Impacted wisdom teeth"],
    solutions: [
      { t: "Professional cleaning (scaling)", involves: "Removing hardened plaque and tartar from above and below the gum line.", suits: "Anyone with tartar build-up or bleeding gums, and as part of routine care." },
      { t: "Fillings", involves: "Removing decay and filling the tooth with a tooth-coloured or other material.", suits: "Small to medium cavities that have not reached the nerve." },
      { t: "Root canal treatment", involves: "Cleaning infected or inflamed pulp from inside the tooth, then sealing and restoring it.", suits: "Deep decay or infection that has reached the nerve of the tooth." },
      { t: "Tooth extraction", involves: "Removing a tooth that cannot be saved, under local anaesthetic.", suits: "Badly broken or decayed teeth, or teeth causing repeated infection." },
      { t: "Desensitising treatment", involves: "Applying protective agents to sensitive areas and advice on home care.", suits: "Sensitivity caused by worn enamel or exposed roots." },
      { t: "Gum therapy", involves: "Deep cleaning of the gums and roots, with follow-up to monitor healing.", suits: "Bleeding, swollen or receding gums." },
      { t: "Wisdom tooth removal", involves: "Assessing the tooth with an X-ray and removing it, surgically if needed.", suits: "Wisdom teeth that are impacted, infected or causing pain." },
    ],
    expect: [
      "An examination and X-ray where needed, so the doctor can see what is causing the problem.",
      "A clear treatment plan explained in plain language, then treatment at a time that suits you.",
      "A follow-up visit to check healing, with advice on looking after your teeth at home.",
    ],
    faq: [
      { q: "Does a root canal hurt?", a: "Root canal treatment is done under local anaesthetic, so most people feel pressure rather than pain during the procedure. Some tenderness for a few days afterwards is common." },
      { q: "Are extractions painful?", a: "The area is numbed with local anaesthetic before the tooth is removed. You may feel pressure but should not feel sharp pain. The doctor will explain aftercare and pain relief." },
      { q: "How often should I have my teeth cleaned?", a: "Many people benefit from a check-up and cleaning every six months, but the right interval depends on your gum health. The doctor will advise what suits you." },
    ],
  },
  {
    slug: "cosmetology",
    name: "Cosmetology",
    icon: "sparkle",
    sub: "Cosmetic dental care for a natural, confident smile.",
    summary: "Whitening, bonding, veneers and smile design to improve the colour and shape of your teeth.",
    points: ["Professional whitening", "Composite bonding and veneers", "Smile design consultation"],
    problems: [
      { icon: "drop", t: "Discoloured teeth", d: "Yellow, brown or grey staining that brushing does not remove." },
      { icon: "crack", t: "Chipped or uneven teeth", d: "Small chips, rough edges or teeth of different lengths." },
      { icon: "gap", t: "Gaps between teeth", d: "Spaces between teeth that you would like to close." },
      { icon: "layers", t: "Worn enamel", d: "Thin, shiny or see-through edges where enamel has worn down." },
      { icon: "smile", t: "Crooked-looking smile", d: "Teeth that look out of line or uneven when you smile." },
    ],
    why: [
      { t: "Staining", d: "Colour from food, drink and tobacco builds up on and inside the enamel over time." },
      { t: "Ageing and enamel wear", d: "Enamel thins with age, letting the darker layer underneath show through." },
      { t: "Minor injury", d: "A small knock or biting something hard can chip the edge of a tooth." },
      { t: "Natural spacing and shape", d: "Some gaps and tooth shapes are simply how the teeth developed." },
    ],
    causes: ["Tea and coffee", "Tobacco use", "Certain medicines", "Genetics", "Habits such as nail biting"],
    solutions: [
      { t: "Professional whitening", involves: "Lightening the colour of natural teeth with a supervised whitening treatment.", suits: "Healthy teeth with surface or age-related staining." },
      { t: "Composite bonding", involves: "Shaping tooth-coloured resin onto the tooth to repair chips or close small gaps.", suits: "Small chips, minor gaps and uneven edges." },
      { t: "Veneers", involves: "Fixing thin, custom-made shells to the front of the teeth to change their colour or shape.", suits: "Teeth that are heavily stained, worn or uneven." },
      { t: "Smile design consultation", involves: "Assessing your smile and discussing which options could meet your goals.", suits: "Anyone considering cosmetic dental work." },
      { t: "Minor orthodontic options", involves: TBC + ".", suits: TBC + ".", tbc: true },
    ],
    expect: [
      "A smile assessment to understand what you would like to change and whether your teeth and gums are healthy.",
      "Shade selection and treatment, with each step explained before it starts.",
      "Aftercare tips to help your results last, with a follow-up if needed.",
    ],
    faq: [
      { q: "How long does whitening last?", a: "Results vary from person to person and depend on diet and habits such as tea, coffee and tobacco. The doctor will advise on how to keep your results for longer." },
      { q: "Are veneers permanent?", a: "Fitting veneers usually involves removing a thin layer of enamel, so the tooth will always need a covering. Veneers themselves may need replacing over time." },
      { q: "Is bonding painful?", a: "Bonding usually needs little or no removal of tooth, and many people do not need an injection. The doctor will check what applies to you." },
    ],
  },
  {
    slug: "implants",
    name: "Implants",
    icon: "implant",
    sub: "Permanent replacement for missing teeth.",
    summary: "Single and multiple implants, and implant-supported bridges and dentures, to replace missing teeth.",
    points: ["Single and multiple implants", "Implant-supported bridges and dentures", "Assessment with X-ray or scan"],
    problems: [
      { icon: "gap", t: "Missing teeth", d: "One or more gaps where teeth have been lost or removed." },
      { icon: "alert", t: "Loose dentures", d: "Dentures that slip, rub or make it hard to eat and speak." },
      { icon: "bolt", t: "Difficulty chewing", d: "Trouble biting or chewing certain foods because of missing teeth." },
      { icon: "face", t: "Changes in facial shape", d: "Cheeks or lips that look sunken after teeth have been lost." },
      { icon: "layers", t: "Bone loss in the jaw", d: "The jawbone shrinking where a tooth is missing." },
    ],
    why: [
      { t: "Tooth loss", d: "Teeth can be lost to decay, gum disease or injury, leaving a gap that affects chewing and appearance." },
      { t: "Jawbone shrinkage", d: "A tooth root keeps the bone around it active. When the root is missing, the jawbone in that area slowly shrinks." },
    ],
    causes: ["Untreated tooth decay", "Periodontal (gum) disease", "Trauma to the mouth", "Long-term denture use"],
    solutions: [
      { t: "Single implant with crown", involves: "Placing one implant in the jaw and fitting a crown on top once it has healed.", suits: "A single missing tooth with enough healthy bone." },
      { t: "Multiple implants", involves: "Placing several implants to replace a number of missing teeth.", suits: "Several missing teeth in different areas of the mouth." },
      { t: "Implant-supported bridge or denture", involves: "Securing a bridge or denture onto implants so it stays firmly in place.", suits: "Several missing teeth in a row, or people with loose dentures." },
      { t: "Bone grafting", involves: TBC + ".", suits: "Where there is not enough bone to hold an implant. " + TBC + ".", tbc: true },
    ],
    expect: [
      "An assessment with an X-ray or scan to check your bone and plan where the implant will go.",
      "Implant placement, followed by a healing period while the implant bonds with the bone (healing time to be confirmed).",
      "Fitting of the crown, bridge or denture, then follow-up visits to check everything is working well.",
    ],
    faq: [
      { q: "Am I a candidate for implants?", a: "Many adults with missing teeth can have implants, but it depends on your bone, gum health and general health. The doctor will assess this with an examination and imaging." },
      { q: "Is the implant procedure painful?", a: "Implants are placed under local anaesthetic. Some soreness and swelling afterwards is common, and the doctor will advise on pain relief and aftercare." },
      { q: "How long do implants last?", a: "With good oral hygiene and regular check-ups, implants are designed to be a long-term solution. The crown on top may need replacing over time." },
    ],
  },
  {
    slug: "facial-trauma",
    name: "Facial Trauma",
    icon: "shield",
    sub: "Urgent and specialist care for injuries to the face, jaw and teeth.",
    summary: "Assessment and treatment of facial fractures, jaw injuries, broken teeth and facial wounds.",
    points: ["Assessment of facial injuries", "Jaw and facial fracture care", "Broken and knocked-out teeth"],
    problems: [
      { icon: "crack", t: "Broken jaw", d: "Pain, swelling or difficulty opening the mouth or biting after an injury." },
      { icon: "face", t: "Facial fractures", d: "Breaks in the cheekbone, eye socket or nose area." },
      { icon: "tooth", t: "Knocked-out or broken teeth", d: "A tooth that has come out completely or broken after a blow." },
      { icon: "drop", t: "Deep facial cuts", d: "Cuts to the face, lips or inside the mouth that may need stitches." },
      { icon: "alert", t: "Swelling after injury", d: "Swelling or bruising of the face or jaw after a fall or blow." },
    ],
    why: [
      { t: "Impact", d: "Falls, road accidents, sports and assault can put sudden force on the face and mouth." },
      { t: "Bone under force", d: "The jaw and facial bones can break when the force is greater than the bone can absorb, and teeth can be loosened or knocked out." },
    ],
    causes: ["Road accidents", "Falls", "Sports injuries", "Physical assault"],
    solutions: [
      { t: "Emergency assessment", involves: "Examining the injury, checking breathing, bleeding and bite, and arranging imaging.", suits: "Anyone with a recent injury to the face, jaw or teeth." },
      { t: "Stabilisation", involves: "Controlling bleeding and supporting injured areas so they do not get worse.", suits: "Fresh injuries before definitive treatment." },
      { t: "Reduction and fixation of fractures", involves: "Putting broken bones back into position and holding them while they heal.", suits: "Jaw and facial bone fractures." },
      { t: "Suturing of wounds", involves: "Cleaning and stitching cuts to the face, lips or inside of the mouth.", suits: "Deep or gaping facial cuts." },
      { t: "Tooth reimplantation", involves: "Placing a knocked-out tooth back into its socket and splinting it, where possible.", suits: "A knocked-out adult tooth that has been kept moist and brought in quickly." },
      { t: "Referral where needed", involves: TBC + ".", suits: "Injuries that need care from another specialist or hospital. " + TBC + ".", tbc: true },
    ],
    expect: [
      "First aid steps at home, then an urgent assessment of the injury at the clinic.",
      "Imaging such as an X-ray or scan to see the full extent of the injury, and a treatment plan.",
      "Treatment and follow-up visits to check healing, bite and function.",
    ],
    firstSteps: [
      "If a tooth is knocked out, hold it by the crown (not the root) and keep it moist.",
      "Apply firm, gentle pressure to any bleeding with a clean cloth.",
      "Use a cold compress on the outside of the face to reduce swelling.",
      "Seek care urgently. For heavy bleeding, breathing difficulty or head injury, go to the nearest hospital emergency department.",
    ],
    faq: [
      { q: "What should I do after a knocked-out tooth?", a: "Hold the tooth by the crown, not the root. Keep it moist and seek care as quickly as possible, as the chance of saving it is better when treated early." },
      { q: "Can a broken jaw heal on its own?", a: "A broken jaw needs to be assessed by a specialist. Some fractures need the bones to be repositioned and held in place to heal correctly, so do not wait to see if it settles." },
      { q: "When is it an emergency?", a: "Heavy bleeding, difficulty breathing or swallowing, a change in your bite, or a head injury need urgent care. Call the clinic or go to the nearest emergency department." },
    ],
  },
  {
    slug: "maxillofacial",
    name: "Maxillofacial",
    icon: "profile",
    sub: "Surgical care for the jaw, face and mouth.",
    summary: "Surgical extraction, cyst and lesion removal, jaw joint treatment and jaw surgery referral.",
    points: ["Surgical and wisdom tooth extraction", "Cyst and lesion removal", "Jaw joint treatment"],
    problems: [
      { icon: "bolt", t: "Jaw joint pain or clicking", d: "Pain, clicking or locking near the ear when opening or closing the mouth." },
      { icon: "alert", t: "Facial swelling", d: "Swelling of the face or jaw, sometimes with pain or fever." },
      { icon: "circle", t: "Cysts", d: "Fluid-filled swellings that can form in the jaw." },
      { icon: "tooth", t: "Wisdom tooth surgery", d: "Wisdom teeth that are stuck or growing at an angle." },
      { icon: "drop", t: "Oral lesions", d: "Patches, lumps or ulcers in the mouth that do not heal." },
      { icon: "face", t: "Jaw misalignment", d: "Upper and lower jaws that do not meet properly." },
    ],
    why: [
      { t: "Joint strain", d: "Grinding, clenching or injury can strain the jaw joint and the muscles around it." },
      { t: "Infection", d: "Infection from a tooth or gum can spread into the surrounding tissue and cause swelling." },
      { t: "Cysts and impacted teeth", d: "Cysts can form in the jaw, and wisdom teeth can become stuck if there is not enough space." },
      { t: "Growths in the mouth", d: "Lumps and patches in the mouth can have many causes and need to be examined." },
    ],
    causes: ["Teeth grinding", "Infection", "Impacted wisdom teeth", "Injury", "Certain diseases (" + TBC.toLowerCase() + ")"],
    solutions: [
      { t: "Surgical extraction", involves: "Removing teeth that cannot be taken out simply, such as impacted wisdom teeth.", suits: "Impacted, broken or hard-to-reach teeth." },
      { t: "Cyst removal", involves: "Surgically removing a cyst from the jaw and checking the area as it heals.", suits: "Cysts found on examination or imaging." },
      { t: "Jaw joint treatment", involves: "Assessing the joint and recommending treatment for pain, clicking or locking.", suits: "Ongoing jaw joint pain or restricted opening." },
      { t: "Biopsy and lesion removal", involves: "Removing a lesion, or a small sample of it, to be examined.", suits: "Lumps, patches or ulcers in the mouth that do not heal." },
      { t: "Orthognathic (jaw) surgery referral", involves: "Assessing jaw position and referring for corrective jaw surgery where needed.", suits: "Significant jaw misalignment affecting bite or appearance." },
    ],
    expect: [
      "A consultation to understand your symptoms and examine your jaw, face and mouth.",
      "Imaging and surgical planning, with the procedure and its risks explained before you decide.",
      "Recovery guidance and follow-up visits to check healing.",
    ],
    faq: [
      { q: "Is jaw surgery painful?", a: "Surgery is done under anaesthetic, so you should not feel pain during the procedure. Some pain and swelling afterwards is expected, and the doctor will advise on pain relief." },
      { q: "How long is recovery?", a: "Recovery depends on the procedure. The doctor will give you an expected recovery time after assessing your case." },
      { q: "When does an impacted wisdom tooth need to be removed?", a: "Removal is often advised when an impacted wisdom tooth causes pain, infection, damage to nearby teeth or cysts. The doctor will check with an X-ray." },
    ],
  },
];
