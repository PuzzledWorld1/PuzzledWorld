// Real public-domain paintings from the National Gallery of Art's open
// access collection (CC0 - https://github.com/NationalGalleryOfArt/opendata),
// sourced via Wikimedia Commons, which hosts NGA's donated open-access
// images. No AI-generated art. Each entry bundles its own local copy
// (works fully offline) and points at the same file on Commons for a
// higher-resolution fetch when the device is online.
function commonsUrl(filename, width) {
  return (
    'https://commons.wikimedia.org/wiki/Special:FilePath/' +
    encodeURIComponent(filename) +
    `?width=${width}`
  );
}


export const GALLERY_ARTWORKS = [
  {
    id: 'van-gogh-self-portrait',
    title: 'Self-Portrait',
    artist: 'Vincent van Gogh',
    year: '1889',
    localImage: require('../assets/gallery/van-gogh-self-portrait.jpg'),
    remoteUrl: commonsUrl(
      'Vincent van Gogh - Self-Portrait - Google Art Project (719161).jpg',
      1400
    ),
  },

  {
    id: 'monet-argenteuil',
    title: 'Argenteuil',
    artist: 'Claude Monet',
    year: 'c. 1872',
    localImage: require('../assets/gallery/monet-argenteuil.jpg'),
    remoteUrl: commonsUrl(
      'Claude Monet, Argenteuil, c. 1872, NGA 52186.jpg',
      1400
    ),
  },

  {
    id: 'monet-artists-garden',
    title: "The Artist's Garden in Argenteuil",
    artist: 'Claude Monet',
    year: '1873',
    localImage: require('../assets/gallery/monet-artists-garden.jpg'),
    remoteUrl: commonsUrl(
      "Claude Monet, The Artist's Garden in Argenteuil (A Corner of the Garden with Dahlias), 1873, NGA 72138.jpg",
      1400
    ),
  },

  {
    id: 'manet-oysters',
    title: 'Oysters',
    artist: 'Édouard Manet',
    year: '1862',
    localImage: require('../assets/gallery/manet-oysters.jpg'),
    remoteUrl: commonsUrl(
      'Edouard Manet, Oysters, 1862, NGA 46427.jpg',
      1400
    ),
  },

  {
    id: 'manet-masked-ball',
    title: 'Masked Ball at the Opera',
    artist: 'Édouard Manet',
    year: '1873',
    localImage: require('../assets/gallery/manet-masked-ball.jpg'),
    remoteUrl: commonsUrl(
      'Edouard Manet, Masked Ball at the Opera, 1873, NGA 61246.jpg',
      1400
    ),
  },

  {
    id: 'cassatt-children-on-the-beach',
    title: 'Children on the Beach',
    artist: 'Mary Cassatt',
    year: '1884',
    localImage: require('../assets/gallery/cassatt-children-on-the-beach.jpg'),
    remoteUrl: commonsUrl(
      'Cassatt Mary Children on the Beach 1884.jpg',
      1400
    ),
  },

  {
    id: 'homer-hound-and-hunter',
    title: 'Hound and Hunter',
    artist: 'Winslow Homer',
    year: '1892',
    localImage: require('../assets/gallery/homer-hound-and-hunter.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer - Hound and Hunter (1892).jpg',
      1400
    ),
  },

  {
    id: 'cezanne-three-pears',
    title: 'Three Pears',
    artist: 'Paul Cézanne',
    year: 'c. 1878-1879',
    localImage: require('../assets/gallery/cezanne-three-pears.jpg'),
    remoteUrl: commonsUrl(
      'Paul Cézanne - Trois poires (National Gallery of Art).jpg',
      1400
    ),
  },

  {
    id: 'manet-king-charles-spaniel',
    title: 'A King Charles Spaniel',
    artist: 'Édouard Manet',
    year: 'c. 1866',
    localImage: require('../assets/gallery/manet-king-charles-spaniel.jpg'),
    remoteUrl: commonsUrl(
      'Edouard Manet, A King Charles Spaniel, c. 1866, NGA 52180.jpg',
      1400
    ),
  },

  {
    id: 'manet-at-the-races',
    title: 'At the Races',
    artist: 'Édouard Manet',
    year: 'c. 1875',
    localImage: require('../assets/gallery/manet-at-the-races.jpg'),
    remoteUrl: commonsUrl(
      'Edouard Manet, At the Races, c. 1875, NGA 1180.jpg',
      1400
    ),
  },

  {
    id: 'manet-flowers-crystal-vase',
    title: 'Flowers in a Crystal Vase',
    artist: 'Édouard Manet',
    year: 'c. 1882',
    localImage: require('../assets/gallery/manet-flowers-crystal-vase.jpg'),
    remoteUrl: commonsUrl(
      'Edouard Manet, Flowers in a Crystal Vase, c. 1882, NGA 52181.jpg',
      1400
    ),
  },

  {
    id: 'manet-madame-michel-levy',
    title: 'Madame Michel-Lévy',
    artist: 'Édouard Manet',
    year: '1882',
    localImage: require('../assets/gallery/manet-madame-michel-levy.jpg'),
    remoteUrl: commonsUrl(
      'Edouard Manet, Madame Michel-Lévy, 1882, NGA 46636.jpg',
      1400
    ),
  },

  {
    id: 'manet-pears',
    title: 'Pears',
    artist: 'Édouard Manet',
    year: '1880',
    localImage: require('../assets/gallery/manet-pears.jpg'),
    remoteUrl: commonsUrl(
      'Edouard Manet, Pears, 1880, NGA 164938.jpg',
      1400
    ),
  },

  {
    id: 'manet-portrait-of-a-lady',
    title: 'Portrait of a Lady',
    artist: 'Édouard Manet',
    year: 'c. 1879',
    localImage: require('../assets/gallery/manet-portrait-of-a-lady.jpg'),
    remoteUrl: commonsUrl(
      'Edouard Manet, Portrait of a Lady, c. 1879, NGA 42284.jpg',
      1400
    ),
  },

  {
    id: 'monet-interior-after-dinner',
    title: 'Interior, after Dinner',
    artist: 'Claude Monet',
    year: '1868-1869',
    localImage: require('../assets/gallery/monet-interior-after-dinner.jpg'),
    remoteUrl: commonsUrl(
      'Claude Monet, Interior, after Dinner, 1868-1869, NGA 61376.jpg',
      1400
    ),
  },

  {
    id: 'cezanne-apples-and-peaches',
    title: 'Still Life with Apples and Peaches',
    artist: 'Paul Cézanne',
    year: 'c. 1905',
    localImage: require('../assets/gallery/cezanne-apples-and-peaches.jpg'),
    remoteUrl: commonsUrl(
      'Paul Cézanne - Nature morte avec pommes et pêches (National Gallery of Art).jpg',
      1400
    ),
  },

  {
    id: 'cezanne-milk-and-fruit',
    title: 'Still Life with Milk Can and Fruit',
    artist: 'Paul Cézanne',
    year: 'c. 1900',
    localImage: require('../assets/gallery/cezanne-milk-and-fruit.jpg'),
    remoteUrl: commonsUrl(
      'Paul Cézanne - Nature morte avec du lait et des fruits (National Gallery of Art Washington).jpg',
      1400
    ),
  },

  {
    id: 'cezanne-bottle-of-peppermint',
    title: 'The Bottle of Peppermint',
    artist: 'Paul Cézanne',
    year: '1893-1895',
    localImage: require('../assets/gallery/cezanne-bottle-of-peppermint.jpg'),
    remoteUrl: commonsUrl(
      'Paul Cézanne - La bouteille de menthe poivrée (National Gallery of Art).jpg',
      1400
    ),
  },

  {
    id: 'degas-dance-class',
    title: 'The Dance Class',
    artist: 'Edgar Degas',
    year: 'c. 1873',
    localImage: require('../assets/gallery/degas-dance-class.jpg'),
    remoteUrl: commonsUrl(
      'Hilaire-Germain-Edgar Degas, The Dance Class, c. 1873, NGA 165300.jpg',
      1400
    ),
  },

  {
    id: 'degas-the-loge',
    title: 'The Loge',
    artist: 'Edgar Degas',
    year: 'c. 1883',
    localImage: require('../assets/gallery/degas-the-loge.jpg'),
    remoteUrl: commonsUrl(
      'Edgar Degas, The Loge, c. 1883, NGA 57514.jpg',
      1400
    ),
  },

  {
    id: 'whistler-wapping',
    title: 'Wapping',
    artist: 'James McNeill Whistler',
    year: '1860-1864',
    localImage: require('../assets/gallery/whistler-wapping.jpg'),
    remoteUrl: commonsUrl(
      'James McNeill Whistler, Wapping, 1860-1864, NGA 61254.jpg',
      1400
    ),
  },

  {
    id: 'sargent-street-in-venice',
    title: 'Street in Venice',
    artist: 'John Singer Sargent',
    year: '1882',
    localImage: require('../assets/gallery/sargent-street-in-venice.jpg'),
    remoteUrl: commonsUrl(
      'John Singer Sargent, Street in Venice, 1882, NGA 46428.jpg',
      1400
    ),
  },

  {
    id: 'eakins-baby-at-play',
    title: 'Baby at Play',
    artist: 'Thomas Eakins',
    year: '1876',
    localImage: require('../assets/gallery/eakins-baby-at-play.jpg'),
    remoteUrl: commonsUrl(
      'Thomas Eakins, Baby at Play, 1876, NGA 61251.jpg',
      1400
    ),
  },

  {
    id: 'morisot-daughter-with-parakeet',
    title: "The Artist's Daughter with a Parakeet",
    artist: 'Berthe Morisot',
    year: '1890',
    localImage: require('../assets/gallery/morisot-daughter-with-parakeet.jpg'),
    remoteUrl: commonsUrl(
      "Berthe Morisot, The Artist's Daughter with a Parakeet, 1890, NGA 46525.jpg",
      1400
    ),
  },

  {
    id: 'pissarro-artists-garden-eragny',
    title: "The Artist's Garden at Eragny",
    artist: 'Camille Pissarro',
    year: '1898',
    localImage: require('../assets/gallery/pissarro-artists-garden-eragny.jpg'),
    remoteUrl: commonsUrl(
      "Camille Pissarro, The Artist's Garden at Eragny, 1898, NGA 52198.jpg",
      1400
    ),
  },

  {
    id: 'renoir-woman-with-a-cat',
    title: 'Woman with a Cat',
    artist: 'Pierre-Auguste Renoir',
    year: 'c. 1875',
    localImage: require('../assets/gallery/renoir-woman-with-a-cat.jpg'),
    remoteUrl: commonsUrl(
      'Auguste Renoir, Woman with a Cat, c. 1875, NGA 37637.jpg',
      1400
    ),
  },

  {
    id: 'homer-mending-nets',
    title: 'Mending Nets',
    artist: 'Winslow Homer',
    year: '1888',
    localImage: require('../assets/gallery/homer-mending-nets.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer - Mending Nets, 1888 (NGA).jpg',
      1400
    ),
  },

  {
    id: 'davinci-ginevra-de-benci',
    title: "Ginevra de' Benci",
    artist: 'Leonardo da Vinci',
    year: 'c. 1474-1478',
    localImage: require('../assets/gallery/davinci-ginevra-de-benci.jpg'),
    remoteUrl: commonsUrl(
      "Ginevra de' Benci - National Gallery of Art.jpg",
      1400
    ),
  },

  {
    id: 'vermeer-woman-holding-a-balance',
    title: 'Woman Holding a Balance',
    artist: 'Johannes Vermeer',
    year: 'c. 1664',
    localImage: require('../assets/gallery/vermeer-woman-holding-a-balance.jpg'),
    remoteUrl: commonsUrl(
      'Johannes Vermeer, Woman Holding a Balance, c. 1664, NGA 1236.jpg',
      1400
    ),
  },

  {
    id: 'rembrandt-self-portrait-1659',
    title: 'Self-Portrait',
    artist: 'Rembrandt van Rijn',
    year: '1659',
    localImage: require('../assets/gallery/rembrandt-self-portrait-1659.jpg'),
    remoteUrl: commonsUrl(
      'Rembrandt van Rijn - Self-Portrait (1659).jpg',
      1400
    ),
  },

  {
    id: 'homer-breezing-up',
    title: 'Breezing Up (A Fair Wind)',
    artist: 'Winslow Homer',
    year: '1873-1876',
    localImage: require('../assets/gallery/homer-breezing-up.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer - Breezing Up (A Fair Wind).jpg',
      1400
    ),
  },

  {
    id: 'stuart-the-skater',
    title: 'The Skater (Portrait of William Grant)',
    artist: 'Gilbert Stuart',
    year: '1782',
    localImage: require('../assets/gallery/stuart-the-skater.jpg'),
    remoteUrl: commonsUrl(
      'Gilbert Stuart, The Skater (Portrait of William Grant), 1782, NGA 39729.jpg',
      1400
    ),
  },

  {
    id: 'van-eyck-the-annunciation',
    title: 'The Annunciation',
    artist: 'Jan van Eyck',
    year: '1434-1436',
    localImage: require('../assets/gallery/van-eyck-the-annunciation.jpg'),
    remoteUrl: commonsUrl(
      'Annunciation - Jan van Eyck - 1434 - NG Wash DC.jpg',
      1400
    ),
  },

  {
    id: 'constable-salisbury-cathedral',
    title: 'Salisbury Cathedral from Lower Marsh Close',
    artist: 'John Constable',
    year: '1820',
    localImage: require('../assets/gallery/constable-salisbury-cathedral.jpg'),
    remoteUrl: commonsUrl(
      'John Constable, Salisbury Cathedral from Lower Marsh Close, 1820, NGA 115.jpg',
      1400
    ),
  },

  {
    id: 'constable-white-horse',
    title: 'The White Horse',
    artist: 'John Constable',
    year: '1818-1819',
    localImage: require('../assets/gallery/constable-white-horse.jpg'),
    remoteUrl: commonsUrl(
      'John Constable, The White Horse, 1818-1819, NGA 1146.jpg',
      1400
    ),
  },

  {
    id: 'constable-cloud-study',
    title: 'Cloud Study - Stormy Sunset',
    artist: 'John Constable',
    year: '1821-1822',
    localImage: require('../assets/gallery/constable-cloud-study.jpg'),
    remoteUrl: commonsUrl(
      'John Constable, Cloud Study - Stormy Sunset, 1821-1822, NGA 104243.jpg',
      1400
    ),
  },

  {
    id: 'corot-view-near-volterra',
    title: 'A View near Volterra',
    artist: 'Jean-Baptiste-Camille Corot',
    year: '1838',
    localImage: require('../assets/gallery/corot-view-near-volterra.jpg'),
    remoteUrl: commonsUrl(
      'Jean-Baptiste-Camille Corot, A View near Volterra, 1838, NGA 46586.jpg',
      1400
    ),
  },

  {
    id: 'corot-beach-near-etretat',
    title: 'Beach near Etretat',
    artist: 'Jean-Baptiste-Camille Corot',
    year: 'c. 1872',
    localImage: require('../assets/gallery/corot-beach-near-etretat.jpg'),
    remoteUrl: commonsUrl(
      'Jean-Baptiste-Camille Corot, Beach near Etretat, c. 1872, NGA 52261.jpg',
      1400
    ),
  },

  {
    id: 'corot-bridge-saone-macon',
    title: 'Bridge on the Saône River at Mâcon',
    artist: 'Jean-Baptiste-Camille Corot',
    year: '1834',
    localImage: require('../assets/gallery/corot-bridge-saone-macon.jpg'),
    remoteUrl: commonsUrl(
      'Jean-Baptiste-Camille Corot, Bridge on the Saône River at Mâcon, 1834, NGA 52166.jpg',
      1400
    ),
  },

  {
    id: 'corot-ville-d-avray',
    title: "Ville-d'Avray",
    artist: 'Jean-Baptiste-Camille Corot',
    year: 'c. 1865',
    localImage: require('../assets/gallery/corot-ville-d-avray.jpg'),
    remoteUrl: commonsUrl(
      "Jean-Baptiste-Camille Corot, Ville-d'Avray, c. 1865, NGA 43430.jpg",
      1400
    ),
  },

  {
    id: 'corot-forest-of-coubron',
    title: 'The Forest of Coubron',
    artist: 'Jean-Baptiste-Camille Corot',
    year: '1872',
    localImage: require('../assets/gallery/corot-forest-of-coubron.jpg'),
    remoteUrl: commonsUrl(
      'Jean-Baptiste-Camille Corot, The Forest of Coubron, 1872, NGA 1149.jpg',
      1400
    ),
  },

  {
    id: 'corot-italian-peasant-boy',
    title: 'Italian Peasant Boy',
    artist: 'Jean-Baptiste-Camille Corot',
    year: '1825-1827',
    localImage: require('../assets/gallery/corot-italian-peasant-boy.jpg'),
    remoteUrl: commonsUrl(
      'Jean-Baptiste-Camille Corot, Italian Peasant Boy, 1825-1827, NGA 46483.jpg',
      1400
    ),
  },

  {
    id: 'corot-madame-stumpf',
    title: 'Madame Stumpf and Her Daughter',
    artist: 'Jean-Baptiste-Camille Corot',
    year: '1872',
    localImage: require('../assets/gallery/corot-madame-stumpf.jpg'),
    remoteUrl: commonsUrl(
      'Jean-Baptiste-Camille Corot, Madame Stumpf and Her Daughter, 1872, NGA 52167.jpg',
      1400
    ),
  },

  {
    id: 'sisley-boulevard-heloise',
    title: 'Boulevard Héloïse, Argenteuil',
    artist: 'Alfred Sisley',
    year: '1872',
    localImage: require('../assets/gallery/sisley-boulevard-heloise.jpg'),
    remoteUrl: commonsUrl(
      'Alfred Sisley, Boulevard Héloïse, Argenteuil, 1872, NGA 52226.jpg',
      1400
    ),
  },

  {
    id: 'sisley-first-snow-veneux',
    title: 'First Snow at Veneux-Nadon',
    artist: 'Alfred Sisley',
    year: '1878',
    localImage: require('../assets/gallery/sisley-first-snow-veneux.jpg'),
    remoteUrl: commonsUrl(
      'Alfred Sisley, First Snow at Veneux-Nadon, 1878, NGA 62641.jpg',
      1400
    ),
  },

  {
    id: 'sisley-flood-port-marly',
    title: 'Flood at Port-Marly',
    artist: 'Alfred Sisley',
    year: '1872',
    localImage: require('../assets/gallery/sisley-flood-port-marly.jpg'),
    remoteUrl: commonsUrl(
      'Alfred Sisley, Flood at Port-Marly, 1872, NGA 66436.jpg',
      1400
    ),
  },

  {
    id: 'sisley-marly-le-roi',
    title: 'Marly-le-Roi',
    artist: 'Alfred Sisley',
    year: 'c. 1875',
    localImage: require('../assets/gallery/sisley-marly-le-roi.jpg'),
    remoteUrl: commonsUrl(
      'Alfred Sisley, Marly-le-Roi, c. 1875, NGA 177090.jpg',
      1400
    ),
  },

  {
    id: 'chardin-fruit-jug-glass',
    title: 'Fruit, Jug, and a Glass',
    artist: 'Jean Siméon Chardin',
    year: 'c. 1726-1728',
    localImage: require('../assets/gallery/chardin-fruit-jug-glass.jpg'),
    remoteUrl: commonsUrl(
      'Jean Siméon Chardin, Fruit, Jug, and a Glass, c. 1726-1728, NGA 12202.jpg',
      1400
    ),
  },

  {
    id: 'chardin-soap-bubbles',
    title: 'Soap Bubbles',
    artist: 'Jean Siméon Chardin',
    year: 'probably 1733-1734',
    localImage: require('../assets/gallery/chardin-soap-bubbles.jpg'),
    remoteUrl: commonsUrl(
      'Jean Siméon Chardin, Soap Bubbles, probably 1733-1734, NGA 994.jpg',
      1400
    ),
  },

  {
    id: 'chardin-white-mug',
    title: 'Still Life with a White Mug',
    artist: 'Jean Siméon Chardin',
    year: 'c. 1764',
    localImage: require('../assets/gallery/chardin-white-mug.jpg'),
    remoteUrl: commonsUrl(
      'Jean Siméon Chardin, Still Life with a White Mug, c. 1764, NGA 53124.jpg',
      1400
    ),
  },

  {
    id: 'chardin-house-of-cards',
    title: 'The House of Cards',
    artist: 'Jean Siméon Chardin',
    year: 'probably 1737',
    localImage: require('../assets/gallery/chardin-house-of-cards.jpg'),
    remoteUrl: commonsUrl(
      'Jean Siméon Chardin, The House of Cards, probably 1737, NGA 97.jpg',
      1400
    ),
  },

  {
    id: 'chardin-kitchen-maid',
    title: 'The Kitchen Maid',
    artist: 'Jean Siméon Chardin',
    year: '1738',
    localImage: require('../assets/gallery/chardin-kitchen-maid.jpg'),
    remoteUrl: commonsUrl(
      'Jean Siméon Chardin, The Kitchen Maid, 1738, NGA 41650.jpg',
      1400
    ),
  },

  {
    id: 'bellows-anne-japanese-parasol',
    title: 'Anne with a Japanese Parasol',
    artist: 'George Bellows',
    year: '1917',
    localImage: require('../assets/gallery/bellows-anne-japanese-parasol.jpg'),
    remoteUrl: commonsUrl(
      'George Bellows, Anne with a Japanese Parasol, 1917, NGA 61351.jpg',
      1400
    ),
  },

  {
    id: 'bellows-blue-morning',
    title: 'Blue Morning',
    artist: 'George Bellows',
    year: '1909',
    localImage: require('../assets/gallery/bellows-blue-morning.jpg'),
    remoteUrl: commonsUrl(
      'George Bellows, Blue Morning, 1909, NGA 46557.jpg',
      1400
    ),
  },

  {
    id: 'bellows-chester-dale',
    title: 'Chester Dale',
    artist: 'George Bellows',
    year: '1922',
    localImage: require('../assets/gallery/bellows-chester-dale.jpg'),
    remoteUrl: commonsUrl(
      'George Bellows, Chester Dale, 1922, NGA 30743.jpg',
      1400
    ),
  },

  {
    id: 'bellows-my-family',
    title: 'My Family',
    artist: 'George Bellows',
    year: '1916',
    localImage: require('../assets/gallery/bellows-my-family.jpg'),
    remoteUrl: commonsUrl(
      'George Bellows, My Family, 1916, NGA 61353.jpg',
      1400
    ),
  },

  {
    id: 'bellows-new-york',
    title: 'New York',
    artist: 'George Bellows',
    year: '1911',
    localImage: require('../assets/gallery/bellows-new-york.jpg'),
    remoteUrl: commonsUrl(
      'George Bellows, New York, 1911, NGA 69392.jpg',
      1400
    ),
  },

  {
    id: 'bellows-lone-tenement',
    title: 'The Lone Tenement',
    artist: 'George Bellows',
    year: '1909',
    localImage: require('../assets/gallery/bellows-lone-tenement.jpg'),
    remoteUrl: commonsUrl(
      'George Bellows, The Lone Tenement, 1909, NGA 46558.jpg',
      1400
    ),
  },

  {
    id: 'turner-approach-to-venice',
    title: 'Approach to Venice',
    artist: 'J.M.W. Turner',
    year: '1844',
    localImage: require('../assets/gallery/turner-approach-to-venice.jpg'),
    remoteUrl: commonsUrl(
      'Joseph Mallord William Turner, Approach to Venice, 1844, NGA 117.jpg',
      1400
    ),
  },

  {
    id: 'turner-rotterdam-ferry-boat',
    title: 'Rotterdam Ferry-Boat',
    artist: 'J.M.W. Turner',
    year: '1833',
    localImage: require('../assets/gallery/turner-rotterdam-ferry-boat.jpg'),
    remoteUrl: commonsUrl(
      'Joseph Mallord William Turner, Rotterdam Ferry-Boat, 1833, NGA 52279.jpg',
      1400
    ),
  },

  {
    id: 'turner-dogana-santa-maria',
    title: 'The Dogana and Santa Maria della Salute, Venice',
    artist: 'J.M.W. Turner',
    year: '1843',
    localImage: require('../assets/gallery/turner-dogana-santa-maria.jpg'),
    remoteUrl: commonsUrl(
      'Joseph Mallord William Turner, The Dogana and Santa Maria della Salute, Venice, 1843, NGA 46089.jpg',
      1400
    ),
  },

  {
    id: 'turner-junction-thames-medway',
    title: 'The Junction of the Thames and the Medway',
    artist: 'J.M.W. Turner',
    year: '1807',
    localImage: require('../assets/gallery/turner-junction-thames-medway.jpg'),
    remoteUrl: commonsUrl(
      'Joseph Mallord William Turner, The Junction of the Thames and the Medway, 1807, NGA 1226.jpg',
      1400
    ),
  },

  {
    id: 'copley-abigail-babcock',
    title: 'Abigail Smith Babcock (Mrs. Adam Babcock)',
    artist: 'John Singleton Copley',
    year: 'c. 1774',
    localImage: require('../assets/gallery/copley-abigail-babcock.jpg'),
    remoteUrl: commonsUrl(
      'John Singleton Copley, Abigail Smith Babcock (Mrs. Adam Babcock), c. 1774, NGA 65885.jpg',
      1400
    ),
  },

  {
    id: 'copley-fitch-family',
    title: 'Colonel William Fitch and His Sisters Sarah and Ann Fitch',
    artist: 'John Singleton Copley',
    year: '1800-1801',
    localImage: require('../assets/gallery/copley-fitch-family.jpg'),
    remoteUrl: commonsUrl(
      'John Singleton Copley, Colonel William Fitch and His Sisters Sarah and Ann Fitch, 1800-1801, NGA 46008.jpg',
      1400
    ),
  },

  {
    id: 'copley-elizabeth-otis',
    title: 'Elizabeth Gray Otis (Mrs. Samuel Alleyne Otis)',
    artist: 'John Singleton Copley',
    year: 'c. 1764',
    localImage: require('../assets/gallery/copley-elizabeth-otis.jpg'),
    remoteUrl: commonsUrl(
      'John Singleton Copley, Elizabeth Gray Otis (Mrs. Samuel Alleyne Otis), c. 1764, NGA 57541.jpg',
      1400
    ),
  },

  {
    id: 'copley-epes-sargent',
    title: 'Epes Sargent',
    artist: 'John Singleton Copley',
    year: 'c. 1760',
    localImage: require('../assets/gallery/copley-epes-sargent.jpg'),
    remoteUrl: commonsUrl(
      'John Singleton Copley, Epes Sargent, c. 1760, NGA 45881.jpg',
      1400
    ),
  },

  {
    id: 'copley-family',
    title: 'The Copley Family',
    artist: 'John Singleton Copley',
    year: '1776-1777',
    localImage: require('../assets/gallery/copley-family.jpg'),
    remoteUrl: commonsUrl(
      'John Singleton Copley, The Copley Family, 1776-1777, NGA 46098.jpg',
      1400
    ),
  },

  {
    id: 'cropsey-tourn-mountain',
    title: 'Tourn Mountain, Head Quarters of Washington, Rockland Co., New York',
    artist: 'Jasper Francis Cropsey',
    year: '1851',
    localImage: require('../assets/gallery/cropsey-tourn-mountain.jpg'),
    remoteUrl: commonsUrl(
      'Jasper Francis Cropsey, Tourn Mountain, Head Quarters of Washington, Rockland Co., New York, 1851, NGA 177779.jpg',
      1400
    ),
  },

  {
    id: 'cropsey-warwick-castle',
    title: 'Warwick Castle, England',
    artist: 'Jasper Francis Cropsey',
    year: '1857',
    localImage: require('../assets/gallery/cropsey-warwick-castle.jpg'),
    remoteUrl: commonsUrl(
      'Jasper Francis Cropsey, Warwick Castle, England, 1857, NGA 73436.jpg',
      1400
    ),
  },

  {
    id: 'cuyp-herdsmen-tending-cattle',
    title: 'Herdsmen Tending Cattle',
    artist: 'Aelbert Cuyp',
    year: '1655-1660',
    localImage: require('../assets/gallery/cuyp-herdsmen-tending-cattle.jpg'),
    remoteUrl: commonsUrl(
      'Aelbert Cuyp, Herdsmen Tending Cattle, 1655-1660, NGA 66.jpg',
      1400
    ),
  },

  {
    id: 'cuyp-horsemen-herdsmen-cattle',
    title: 'Horsemen and Herdsmen with Cattle',
    artist: 'Aelbert Cuyp',
    year: '1655-1660',
    localImage: require('../assets/gallery/cuyp-horsemen-herdsmen-cattle.jpg'),
    remoteUrl: commonsUrl(
      'Aelbert Cuyp, Horsemen and Herdsmen with Cattle, 1655-1660, NGA 1153.jpg',
      1400
    ),
  },

  {
    id: 'cuyp-river-landscape-cows',
    title: 'River Landscape with Cows',
    artist: 'Aelbert Cuyp',
    year: '1645-1650',
    localImage: require('../assets/gallery/cuyp-river-landscape-cows.jpg'),
    remoteUrl: commonsUrl(
      'Aelbert Cuyp, River Landscape with Cows, 1645-1650, NGA 69390.jpg',
      1400
    ),
  },

  {
    id: 'cuyp-lady-gentleman-horseback',
    title: 'Lady and Gentleman on Horseback',
    artist: 'Aelbert Cuyp',
    year: 'c. 1655',
    localImage: require('../assets/gallery/cuyp-lady-gentleman-horseback.jpg'),
    remoteUrl: commonsUrl(
      'Aelbert Cuyp, Lady and Gentleman on Horseback, c. 1655, reworked 1660-1665, NGA 1152.jpg',
      1400
    ),
  },

  {
    id: 'cuyp-pier-dordrecht',
    title: 'A Pier Overlooking Dordrecht',
    artist: 'Aelbert Cuyp',
    year: 'early 1640s',
    localImage: require('../assets/gallery/cuyp-pier-dordrecht.jpg'),
    remoteUrl: commonsUrl(
      'Aelbert Cuyp, A Pier Overlooking Dordrecht, early 1640s, NGA 100922.jpg',
      1400
    ),
  },

  {
    id: 'boudin-beach-at-trouville',
    title: 'Beach at Trouville',
    artist: 'Eugène Boudin',
    year: '1864-1865',
    localImage: require('../assets/gallery/boudin-beach-at-trouville.jpg'),
    remoteUrl: commonsUrl(
      'Eugène Boudin, Beach at Trouville, 1864-1865, NGA 52156.jpg',
      1400
    ),
  },

  {
    id: 'boudin-women-beach-berck',
    title: 'Women on the Beach at Berck',
    artist: 'Eugène Boudin',
    year: '1881',
    localImage: require('../assets/gallery/boudin-women-beach-berck.jpg'),
    remoteUrl: commonsUrl(
      'Eugène Boudin, Women on the Beach at Berck, 1881, NGA 52159.jpg',
      1400
    ),
  },

  {
    id: 'boudin-on-the-beach-trouville',
    title: 'On the Beach, Trouville',
    artist: 'Eugène Boudin',
    year: '1887',
    localImage: require('../assets/gallery/boudin-on-the-beach-trouville.jpg'),
    remoteUrl: commonsUrl(
      'Eugène Boudin, On the Beach, Trouville, 1887, NGA 46480.jpg',
      1400
    ),
  },

  {
    id: 'boudin-the-beach',
    title: 'The Beach',
    artist: 'Eugène Boudin',
    year: '1877',
    localImage: require('../assets/gallery/boudin-the-beach.jpg'),
    remoteUrl: commonsUrl(
      'Eugène Boudin, The Beach, 1877, NGA 52158.jpg',
      1400
    ),
  },

  {
    id: 'boudin-concert-casino-deauville',
    title: 'Concert at the Casino of Deauville',
    artist: 'Eugène Boudin',
    year: '1865',
    localImage: require('../assets/gallery/boudin-concert-casino-deauville.jpg'),
    remoteUrl: commonsUrl(
      'Eugène Boudin, Concert at the Casino of Deauville, 1865, NGA 66401.jpg',
      1400
    ),
  },

  {
    id: 'boudin-festival-harbor-honfleur',
    title: 'Festival in the Harbor of Honfleur',
    artist: 'Eugène Boudin',
    year: '1858',
    localImage: require('../assets/gallery/boudin-festival-harbor-honfleur.jpg'),
    remoteUrl: commonsUrl(
      'Eugène Boudin, Festival in the Harbor of Honfleur, 1858, NGA 61360.jpg',
      1400
    ),
  },

  {
    id: 'bazille-edmond-maitre',
    title: 'Edmond Maître',
    artist: 'Frédéric Bazille',
    year: '1869',
    localImage: require('../assets/gallery/bazille-edmond-maitre.jpg'),
    remoteUrl: commonsUrl(
      'Frédéric Bazille, Edmond Maître, 1869, NGA 66400.jpg',
      1400
    ),
  },

  {
    id: 'bazille-western-ramparts-aigues-mortes',
    title: 'The Western Ramparts at Aigues-Mortes',
    artist: 'Frédéric Bazille',
    year: '1867',
    localImage: require('../assets/gallery/bazille-western-ramparts-aigues-mortes.jpg'),
    remoteUrl: commonsUrl(
      'Frédéric Bazille, The Western Ramparts at Aigues-Mortes, 1867, NGA 66399.jpg',
      1400
    ),
  },

  {
    id: 'chase-english-cod',
    title: 'An English Cod',
    artist: 'William Merritt Chase',
    year: '1904',
    localImage: require('../assets/gallery/chase-english-cod.jpg'),
    remoteUrl: commonsUrl(
      'William Merritt Chase, An English Cod, 1904, NGA 195635.jpg',
      1400
    ),
  },

  {
    id: 'chase-gathering-autumn-flowers',
    title: 'Gathering Autumn Flowers',
    artist: 'William Merritt Chase',
    year: '1894-1895',
    localImage: require('../assets/gallery/chase-gathering-autumn-flowers.jpg'),
    remoteUrl: commonsUrl(
      'William Merritt Chase, Gathering Autumn Flowers, 1894-1895, NGA 157922.jpg',
      1400
    ),
  },

  {
    id: 'chase-self-portrait',
    title: 'Self-Portrait',
    artist: 'William Merritt Chase',
    year: '1915',
    localImage: require('../assets/gallery/chase-self-portrait.jpg'),
    remoteUrl: commonsUrl(
      'William Merritt Chase, Self-Portrait, 1915, NGA 195727.jpg',
      1400
    ),
  },

  {
    id: 'homer-home-sweet-home',
    title: 'Home, Sweet Home',
    artist: 'Winslow Homer',
    year: 'c. 1863',
    localImage: require('../assets/gallery/homer-home-sweet-home.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, Home, Sweet Home, c. 1863, NGA 79933.jpg',
      1400
    ),
  },

  {
    id: 'homer-native-hut-nassau',
    title: 'Native Hut at Nassau',
    artist: 'Winslow Homer',
    year: '1885',
    localImage: require('../assets/gallery/homer-native-hut-nassau.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, Native hut at Nassau, 1885, NGA 89670.jpg',
      1400
    ),
  },

  {
    id: 'homer-incoming-tide-scarboro',
    title: 'Incoming Tide, Scarboro, Maine',
    artist: 'Winslow Homer',
    year: '1883',
    localImage: require('../assets/gallery/homer-incoming-tide-scarboro.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, Incoming Tide, Scarboro, Maine, 1883, NGA 55583.jpg',
      1400
    ),
  },

  {
    id: 'homer-sketch-cottage-yard',
    title: 'Sketch of a Cottage Yard',
    artist: 'Winslow Homer',
    year: 'c. 1876',
    localImage: require('../assets/gallery/homer-sketch-cottage-yard.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, Sketch of a Cottage Yard, c. 1876, NGA 166455.jpg',
      1400
    ),
  },

  {
    id: 'homer-view-santiago-de-cuba',
    title: 'View of Santiago de Cuba',
    artist: 'Winslow Homer',
    year: '1885',
    localImage: require('../assets/gallery/homer-view-santiago-de-cuba.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, View of Santiago de Cuba, 1885, NGA 64553.jpg',
      1400
    ),
  },

  {
    id: 'homer-dads-coming',
    title: "Dad's Coming!",
    artist: 'Winslow Homer',
    year: '1873',
    localImage: require('../assets/gallery/homer-dads-coming.jpg'),
    remoteUrl: commonsUrl(
      "Winslow Homer, Dad's Coming!, 1873, NGA 79891.jpg",
      1400
    ),
  },

  {
    id: 'homer-dinner-horn',
    title: 'The Dinner Horn (Blowing the Horn at Seaside)',
    artist: 'Winslow Homer',
    year: '1870',
    localImage: require('../assets/gallery/homer-dinner-horn.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, The Dinner Horn (Blowing the Horn at Seaside), 1870, NGA 89664.jpg',
      1400
    ),
  },

  {
    id: 'homer-right-and-left',
    title: 'Right and Left',
    artist: 'Winslow Homer',
    year: '1909',
    localImage: require('../assets/gallery/homer-right-and-left.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, Right and Left, 1909, NGA 39763.jpg',
      1400
    ),
  },

  {
    id: 'homer-east-hampton-beach',
    title: 'East Hampton Beach, Long Island',
    artist: 'Winslow Homer',
    year: '1874',
    localImage: require('../assets/gallery/homer-east-hampton-beach.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, East Hampton Beach, Long Island, 1874, NGA 157923.jpg',
      1400
    ),
  },

  {
    id: 'homer-the-flirt',
    title: 'The Flirt',
    artist: 'Winslow Homer',
    year: '1874',
    localImage: require('../assets/gallery/homer-the-flirt.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, The Flirt, 1874, NGA 164928.jpg',
      1400
    ),
  },

  {
    id: 'homer-light-on-the-sea',
    title: 'A Light on the Sea',
    artist: 'Winslow Homer',
    year: '1897',
    localImage: require('../assets/gallery/homer-light-on-the-sea.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, A Light on the Sea, 1897, NGA 166501.jpg',
      1400
    ),
  },

  {
    id: 'homer-sunset-1875',
    title: 'Sunset',
    artist: 'Winslow Homer',
    year: 'c. 1875',
    localImage: require('../assets/gallery/homer-sunset-1875.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, Sunset, c. 1875, NGA 47184.jpg',
      1400
    ),
  },

  {
    id: 'homer-red-school-house',
    title: 'The Red School House',
    artist: 'Winslow Homer',
    year: '1873',
    localImage: require('../assets/gallery/homer-red-school-house.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, The Red School House, 1873, NGA 66419.jpg',
      1400
    ),
  },

  {
    id: 'homer-autumn-1877',
    title: 'Autumn',
    artist: 'Winslow Homer',
    year: '1877',
    localImage: require('../assets/gallery/homer-autumn-1877.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, Autumn, 1877, NGA 66420.jpg',
      1400
    ),
  },

  {
    id: 'homer-school-time',
    title: 'School Time',
    artist: 'Winslow Homer',
    year: 'c. 1874',
    localImage: require('../assets/gallery/homer-school-time.jpg'),
    remoteUrl: commonsUrl(
      'Winslow Homer, School Time, c. 1874, NGA 164929.jpg',
      1400
    ),
  },

  {
    id: 'whistler-white-girl',
    title: 'Symphony in White, No. 1: The White Girl',
    artist: 'James McNeill Whistler',
    year: '1862',
    localImage: require('../assets/gallery/whistler-white-girl.jpg'),
    remoteUrl: commonsUrl(
      'Whistler_James_Symphony_in_White_no_1_(The_White_Girl)_1862.jpg',
      1400
    ),
  },

  {
    id: 'manet-old-musician',
    title: 'The Old Musician',
    artist: 'Édouard Manet',
    year: '1862',
    localImage: require('../assets/gallery/manet-old-musician.jpg'),
    remoteUrl: commonsUrl(
      'Édouard Manet - Le Vieux Musicien.jpg',
      1400
    ),
  },

  {
    id: 'cassatt-boating-party',
    title: 'The Boating Party',
    artist: 'Mary Cassatt',
    year: '1893-1894',
    localImage: require('../assets/gallery/cassatt-boating-party.jpg'),
    remoteUrl: commonsUrl(
      'Mary Cassatt, The Boating Party, 1893-1894, NGA 46569.jpg',
      1400
    ),
  },

  {
    id: 'rembrandt-the-mill',
    title: 'The Mill',
    artist: 'Rembrandt van Rijn',
    year: '1645-1648',
    localImage: require('../assets/gallery/rembrandt-the-mill.jpg'),
    remoteUrl: commonsUrl(
      'Rembrandt van Rijn, The Mill, 1645-1648, NGA 1201.jpg',
      1400
    ),
  },

  {
    id: 'hopper-ground-swell',
    title: 'Ground Swell',
    artist: 'Edward Hopper',
    year: '1939',
    localImage: require('../assets/gallery/hopper-ground-swell.jpg'),
    remoteUrl: commonsUrl(
      'Ground swell 2014.79.23.jpg',
      1400
    ),
  },

  {
    id: 'el-greco-saint-ildefonso',
    title: 'Saint Ildefonso',
    artist: 'El Greco',
    year: 'c. 1603-1614',
    localImage: require('../assets/gallery/el-greco-saint-ildefonso.jpg'),
    remoteUrl: commonsUrl(
      'El Greco (Domenikos Theotokopoulos), Saint Ildefonso, c. 1603-1614, NGA 90.jpg',
      1400
    ),
  },

  {
    id: 'vermeer-lady-writing',
    title: 'A Lady Writing',
    artist: 'Johannes Vermeer',
    year: 'c. 1665',
    localImage: require('../assets/gallery/vermeer-lady-writing.jpg'),
    remoteUrl: commonsUrl(
      'Johannes Vermeer, A Lady Writing, c. 1665, NGA 46437.jpg',
      1400
    ),
  },

  {
    id: 'raphael-saint-george-dragon',
    title: 'Saint George and the Dragon',
    artist: 'Raphael',
    year: 'c. 1506',
    localImage: require('../assets/gallery/raphael-saint-george-dragon.jpg'),
    remoteUrl: commonsUrl(
      'Raphael - Saint George and the Dragon.jpg',
      1400
    ),
  },

  {
    id: 'van-gogh-green-wheat-fields',
    title: 'Green Wheat Fields, Auvers',
    artist: 'Vincent van Gogh',
    year: '1890',
    localImage: require('../assets/gallery/van-gogh-green-wheat-fields.jpg'),
    remoteUrl: commonsUrl(
      'Vincent van Gogh, Green Wheat Fields, Auvers, 1890, NGA 163323.jpg',
      1400
    ),
  },

  {
    id: 'van-gogh-olive-orchard',
    title: 'The Olive Orchard',
    artist: 'Vincent van Gogh',
    year: '1889',
    localImage: require('../assets/gallery/van-gogh-olive-orchard.jpg'),
    remoteUrl: commonsUrl(
      'Vincent van Gogh, The Olive Orchard, 1889, NGA 46627.jpg',
      1400
    ),
  },

  {
    id: 'van-gogh-girl-in-white',
    title: 'Girl in White',
    artist: 'Vincent van Gogh',
    year: '1890',
    localImage: require('../assets/gallery/van-gogh-girl-in-white.jpg'),
    remoteUrl: commonsUrl(
      'Vincent van Gogh, Girl in White, 1890, NGA 46505.jpg',
      1400
    ),
  },

  {
    id: 'van-gogh-roulins-baby',
    title: "Roulin's Baby",
    artist: 'Vincent van Gogh',
    year: '1888',
    localImage: require('../assets/gallery/van-gogh-roulins-baby.jpg'),
    remoteUrl: commonsUrl(
      "Vincent van Gogh, Roulin's Baby, 1888, NGA 46506.jpg",
      1400
    ),
  },

  {
    id: 'rembrandt-woman-holding-pink',
    title: 'A Woman Holding a Pink',
    artist: 'Rembrandt van Rijn',
    year: '1656',
    localImage: require('../assets/gallery/rembrandt-woman-holding-pink.jpg'),
    remoteUrl: commonsUrl(
      'Rembrandt van Rijn, A Woman Holding a Pink, 1656, NGA 82.jpg',
      1400
    ),
  },

  {
    id: 'rembrandt-young-man-seated',
    title: 'A Young Man Seated at a Table (possibly Govaert Flinck)',
    artist: 'Rembrandt van Rijn',
    year: 'c. 1660',
    localImage: require('../assets/gallery/rembrandt-young-man-seated.jpg'),
    remoteUrl: commonsUrl(
      'Rembrandt van Rijn, A Young Man Seated at a Table (possibly Govaert Flinck), c. 1660, NGA 84.jpg',
      1400
    ),
  },

  {
    id: 'rembrandt-man-sheet-music',
    title: 'Man with a Sheet of Music',
    artist: 'Rembrandt van Rijn',
    year: '1633',
    localImage: require('../assets/gallery/rembrandt-man-sheet-music.jpg'),
    remoteUrl: commonsUrl(
      'Rembrandt van Rijn, Man with a Sheet of Music, 1633, NGA 177795.jpg',
      1400
    ),
  },

  {
    id: 'rembrandt-philemon-baucis',
    title: 'Philemon and Baucis',
    artist: 'Rembrandt van Rijn',
    year: '1658',
    localImage: require('../assets/gallery/rembrandt-philemon-baucis.jpg'),
    remoteUrl: commonsUrl(
      'Rembrandt van Rijn, Philemon and Baucis, 1658, NGA 1204.jpg',
      1400
    ),
  },

  {
    id: 'rembrandt-gentleman-tall-hat',
    title: 'Portrait of a Gentleman with a Tall Hat and Gloves',
    artist: 'Rembrandt van Rijn',
    year: 'c. 1656-1658',
    localImage: require('../assets/gallery/rembrandt-gentleman-tall-hat.jpg'),
    remoteUrl: commonsUrl(
      'Rembrandt van Rijn, Portrait of a Gentleman with a Tall Hat and Gloves, c. 1656-1658, NGA 1206.jpg',
      1400
    ),
  },

  {
    id: 'rembrandt-lady-ostrich-fan',
    title: 'Portrait of a Lady with an Ostrich-Feather Fan',
    artist: 'Rembrandt van Rijn',
    year: 'c. 1656-1658',
    localImage: require('../assets/gallery/rembrandt-lady-ostrich-fan.jpg'),
    remoteUrl: commonsUrl(
      'Rembrandt van Rijn, Portrait of a Lady with an Ostrich-Feather Fan, c. 1656-1658, NGA 1207.jpg',
      1400
    ),
  },

  {
    id: 'rembrandt-man-tall-hat',
    title: 'Portrait of a Man in a Tall Hat',
    artist: 'Rembrandt van Rijn',
    year: 'c. 1663',
    localImage: require('../assets/gallery/rembrandt-man-tall-hat.jpg'),
    remoteUrl: commonsUrl(
      'Rembrandt van Rijn, Portrait of a Man in a Tall Hat, c. 1663, NGA 1208.jpg',
      1400
    ),
  },

  {
    id: 'titian-emilia-di-spilimbergo',
    title: 'Emilia di Spilimbergo',
    artist: 'Titian',
    year: 'n.d.',
    localImage: require('../assets/gallery/titian-emilia-di-spilimbergo.jpg'),
    remoteUrl: commonsUrl(
      'Emilia_di_spilimbergo_1942.9.82.jpg',
      1400
    ),
  },

  {
    id: 'titian-woman-holding-apple',
    title: 'Woman Holding an Apple',
    artist: 'Titian',
    year: 'n.d.',
    localImage: require('../assets/gallery/titian-woman-holding-apple.jpg'),
    remoteUrl: commonsUrl(
      'Titian - Woman Holding an Apple.jpg',
      1400
    ),
  },

  {
    id: 'monet-woman-with-a-parasol',
    title: 'Woman with a Parasol - Madame Monet and Her Son',
    artist: 'Claude Monet',
    year: '1875',
    localImage: require('../assets/gallery/monet-woman-with-a-parasol.jpg'),
    remoteUrl: commonsUrl(
      'Claude Monet - Woman with a Parasol - Madame Monet and Her Son - Google Art Project.jpg',
      1400
    ),
  },

  {
    id: 'hicks-peaceable-kingdom',
    title: 'Peaceable Kingdom',
    artist: 'Edward Hicks',
    year: 'c. 1834',
    localImage: require('../assets/gallery/hicks-peaceable-kingdom.jpg'),
    remoteUrl: commonsUrl(
      'Edward Hicks, Peaceable Kingdom, c. 1834, NGA 59908.jpg',
      1400
    ),
  },

  {
    id: 'cole-voyage-of-life-childhood',
    title: 'The Voyage of Life - Childhood',
    artist: 'Thomas Cole',
    year: '1842',
    localImage: require('../assets/gallery/cole-voyage-of-life-childhood.jpg'),
    remoteUrl: commonsUrl(
      'Thomas Cole, The Voyage of Life - Childhood, 1842, NGA 52450.jpg',
      1400
    ),
  },

  {
    id: 'velazquez-needlewoman',
    title: 'The Needlewoman',
    artist: 'Diego Velázquez',
    year: 'c. 1640-1650',
    localImage: require('../assets/gallery/velazquez-needlewoman.jpg'),
    remoteUrl: commonsUrl(
      'Diego Velázquez, The Needlewoman, c. 1640-1650, NGA 88.jpg',
      1400
    ),
  },

];
