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
    id: 'cassatt-the-coiffure',
    title: 'The Coiffure',
    artist: 'Mary Cassatt',
    year: '1890-1891',
    localImage: require('../assets/gallery/cassatt-the-coiffure.jpg'),
    remoteUrl: commonsUrl(
      'Mary Cassatt, The Coiffure, 1890-1891, NGA 5920.jpg',
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
    id: 'raphael-alba-madonna',
    title: 'The Alba Madonna',
    artist: 'Raphael',
    year: 'c. 1510',
    localImage: require('../assets/gallery/raphael-alba-madonna.jpg'),
    remoteUrl: commonsUrl(
      'Raphael, The Alba Madonna, c. 1510, NGA 26.jpg',
      1400
    ),
  },

  {
    id: 'titian-venus-with-a-mirror',
    title: 'Venus with a Mirror',
    artist: 'Titian',
    year: 'c. 1555',
    localImage: require('../assets/gallery/titian-venus-with-a-mirror.jpg'),
    remoteUrl: commonsUrl(
      'Titian - Venus with a Mirror - Google Art Project.jpg',
      1400
    ),
  },

  {
    id: 'botticelli-adoration-of-the-magi',
    title: 'The Adoration of the Magi',
    artist: 'Sandro Botticelli',
    year: 'c. 1478-1482',
    localImage: require('../assets/gallery/botticelli-adoration-of-the-magi.jpg'),
    remoteUrl: commonsUrl(
      'Sandro Botticelli, The Adoration of the Magi, c. 1478-1482, NGA 24.jpg',
      1400
    ),
  },
];
