/* LEmandi — product catalogue for the mockup.
   One entry per product; product.html renders whichever slug is in ?p=.
   In the WooCommerce build each of these becomes a real product with its
   own permalink, so the links stay the same shape.
   NOTE: prices, SKUs and copy here are placeholders for review. Only the
   water heater carries detailed specs; the rest need the client's data. */
window.LEMANDI_CATALOG = {
  cats: {
    sanitary: 'Sanitary Ware &amp; Water Closets',
    basins:   'Basins &amp; Vanities',
    fittings: 'Bathroom Fittings, Showers &amp; Faucets',
    kitchen:  'Kitchen Appliances &amp; Sinks',
    lighting: 'Lighting &amp; Ceiling Fans',
    water:    'Water Heaters &amp; Ventilation'
  },
  items: {
    'water-heater': {
      name: 'Instant Water Heater with Booster Pump',
      cat: 'water', brand: 'Joven', sku: 'LM-WH-0560',
      price: 560, was: 699,
      images: [
        ['assets/cat6.jpg', 'Instant water heater with hand shower mounted on a beige wall'],
        ['assets/p3.jpg',   'Rain shower running in a dark tiled bathroom'],
        ['assets/cat3.jpg', 'Shower fittings in a marble bathroom'],
        ['assets/showroom.jpg', 'Bathroom room set on the showroom floor']
      ],
      points: [
        'Built-in booster pump for steady pressure on upper floors',
        'Heats instantly, so no storage tank and no waiting',
        'Splash-protected casing suited to Malaysian bathrooms',
        'See it up close at the Balakong showroom'
      ],
      colours: ['Graphite', 'White'],
      desc: 'An instant water heater with a built-in booster pump, made for homes where the shower pressure never quite keeps up. It heats water as it flows, so there is no tank to wait for and no tank to run cold. Come by the showroom and our team will help you compare it against the storage-tank options.',
      specs: [['Heating type','Instant, tankless'],['Booster pump','Built-in, low-noise'],['Power rating','3.6 kW, 240 V'],['Splash protection','IP25 rated casing'],['Shower set','Hand shower, hose and rail included'],['Colour options','Graphite, White']],
      anno: [
        ['top:12%;left:6%',  'The pump sits inside the casing, so there is nothing extra to mount on the wall'],
        ['top:44%;right:8%', 'One dial. Water temperature stays where you set it, even when pressure dips'],
        ['bottom:10%;left:12%', 'Fits over standard Malaysian bathroom points, common in Klang Valley homes']
      ]
    },
    'smart-toilet': {
      name: 'Smart Toilet with Heated Seat', cat: 'sanitary', sku: 'LM-SW-2199',
      price: 2199,
      images: [['assets/cat1.jpg','Smart toilet with heated seat'],['assets/p1.jpg','Two-piece toilet bowl on display'],['assets/showroom.jpg','Bathroom room set on the showroom floor']],
      points: ['Heated seat with adjustable settings','Integrated bidet wash functions','One-piece form that wipes down easily','On display at the Balakong showroom'],
      colours: ['White'],
      desc: 'A one-piece smart toilet with a heated seat and integrated wash functions. It is one of the pieces customers most often want to see working before they buy, so we keep it powered up on the showroom floor. Ask our team about the installation points it needs.'
    },
    'toilet-bowl': {
      name: 'Two-Piece Toilet Bowl, S-Trap', cat: 'sanitary', sku: 'LM-WC-0489',
      price: 489, was: 620,
      images: [['assets/p1.jpg','Two-piece toilet bowl'],['assets/cat1.jpg','Smart toilet and sanitary ware'],['assets/showroom.jpg','Bathroom room set on the showroom floor']],
      points: ['S-trap outlet, the common fit for Malaysian homes','Two-piece build, straightforward to install and service','Easy-clean glazed finish','Warehouse-direct price, no retail markup'],
      colours: ['White'],
      desc: 'A two-piece toilet bowl with an S-trap outlet, the configuration most Malaysian homes are already plumbed for. A reliable, no-fuss choice for a renovation where the budget matters. Bring a photo of your existing outlet and our team will confirm the fit.'
    },
    'countertop-basin': {
      name: 'Countertop Basin, Matte White', cat: 'basins', sku: 'LM-BS-0259',
      price: 259,
      images: [['assets/cat2.jpg','Countertop basin on a wooden vanity'],['assets/p6.jpg','Bathroom vanity with basin on display'],['assets/showroom.jpg','Bathroom room set on the showroom floor']],
      points: ['Sits on top of the counter, no cut-out needed','Matte white finish','Pairs with most wall and tall mixers','See the finish in person before you commit'],
      colours: ['Matte white'],
      desc: 'A countertop basin in a matte white finish, designed to sit on the vanity top rather than drop into it. Matte finishes read very differently in person than in photos, so it is worth seeing this one on the floor before you decide.'
    },
    'vanity-cabinet': {
      name: 'Bathroom Vanity Cabinet with Basin', cat: 'basins', sku: 'LM-VN-1190',
      price: 1190,
      images: [['assets/p6.jpg','Bathroom vanity with basin on display'],['assets/cat2.jpg','Countertop basin and cabinet'],['assets/showroom.jpg','Bathroom room set on the showroom floor']],
      points: ['Cabinet and basin supplied together','Soft-close drawers','Wood-look finish that suits warm bathrooms','Sizes on the floor at the Balakong showroom'],
      colours: ['Wood', 'White'],
      desc: 'A vanity cabinet supplied together with its basin, so the proportions are already right and you are not matching two purchases. Come and open the drawers, check the depth against your bathroom and our team will talk you through the sizes we can get.'
    },
    'rain-shower': {
      name: 'Rain Shower Set with Hand Shower', cat: 'fittings', sku: 'LM-SH-0399',
      price: 399,
      images: [['assets/p3.jpg','Rain shower set running against dark tiles'],['assets/cat3.jpg','Rain shower and fittings in a marble bathroom'],['assets/showroom.jpg','Bathroom room set on the showroom floor']],
      points: ['Overhead rain head plus a hand shower','Diverter to switch between the two','Matte black finish','Try the spray pattern on the showroom floor'],
      colours: ['Matte black', 'Chrome'],
      desc: 'A rain shower set with both an overhead head and a hand shower on a rail, switched by a diverter. We have it plumbed in at the showroom so you can feel the spray rather than guess from a spec sheet.'
    },
    'basin-mixer': {
      name: 'Basin Mixer, Brushed Steel', cat: 'fittings', sku: 'LM-MX-0189',
      price: 189,
      images: [['assets/cat3.jpg','Basin mixer and shower fittings in a marble bathroom'],['assets/cat2.jpg','Countertop basin on a wooden vanity'],['assets/p6.jpg','Bathroom vanity with basin']],
      points: ['Single-lever mixer for hot and cold','Brushed steel finish that hides water marks','Suits both countertop and inset basins','One of our most-asked-about fittings'],
      colours: ['Brushed steel', 'Matte black'],
      desc: 'A single-lever basin mixer in a brushed steel finish. Brushed surfaces hide water spotting far better than polished chrome, which is why it is a popular pick for family bathrooms. Ask us about matching it to the rest of your fittings.'
    },
    'kitchen-sink': {
      name: 'Double Bowl Kitchen Sink, Stainless Steel', cat: 'kitchen', sku: 'LM-KS-0735',
      price: 735,
      images: [['assets/p2.jpg','Double bowl stainless steel kitchen sink'],['assets/cat4.jpg','Stainless steel kitchen sink set into a counter'],['assets/adv.jpg','Bright kitchen with marble island']],
      points: ['Two bowls for washing and draining','Stainless steel, easy to keep clean','Undermount or top-mount depending on your counter','Bring your counter cut-out size and we will check the fit'],
      colours: ['Stainless steel'],
      desc: 'A double bowl stainless steel sink, the practical choice when one bowl is never quite enough. Whether it can be undermounted depends on your countertop material, so bring your measurements and our team will tell you what will work.'
    },
    'ceiling-fan': {
      name: '5-Blade Ceiling Fan with Remote', cat: 'lighting', sku: 'LM-CF-0429',
      price: 429,
      images: [['assets/p5.jpg','Modern black ceiling fan in a living room'],['assets/cat5.jpg','Living room with ceiling fan and warm lighting'],['assets/adv.jpg','Bright kitchen with marble island']],
      points: ['Five blades with remote control','Multiple speed settings','Finish that suits both living and bedrooms','Running on the ceiling at our showroom'],
      colours: ['Black', 'Wood'],
      desc: 'A five-blade ceiling fan with remote control, mounted and running at the showroom so you can hear it at every speed. Ceiling height and blade span matter more than most people expect, so tell us about the room and we will point you at the right size.'
    },
    'pendant-light': {
      name: 'Pendant Light Set of Three', cat: 'lighting', sku: 'LM-PL-0289',
      price: 289,
      images: [['assets/p4.jpg','Set of three pendant lights'],['assets/cat5.jpg','Living room with warm lighting'],['assets/adv.jpg','Bright kitchen with marble island']],
      points: ['Supplied as a set of three','Popular over kitchen islands and dining tables','Adjustable drop height','Lit up on display at the showroom'],
      colours: ['Brass', 'Black'],
      desc: 'A set of three pendants, the arrangement most people want over an island or a dining table. Drop height changes the look completely, so it is worth seeing them lit at the showroom before deciding where to have them hung.'
    }
  }
};
