// These imports should be changed to something better (if it is possible with webpack)
import im3070 from '../assets/images/products/3070.jpg.webp';
import im3070palit from '../assets/images/products/3070palit.jpg.webp';
import r6600 from '../assets/images/products/r6600.png';
import imr550msi from '../assets/images/products/r550msi.png';
import im3080palit from '../assets/images/products/3080palit.png';
import im2060palit from '../assets/images/products/2060palit.png';
import im3060palit from '../assets/images/products/3060palit.png';
import im3080gig from '../assets/images/products/3080Gigabyte.png';
import im1050palit from '../assets/images/products/1050tipalit.png';
import im1660msi from '../assets/images/products/1660msi.png';
import im3060msi from '../assets/images/products/3060msi.png';
import im1660kfa from '../assets/images/products/1660kfa.png';
import im3080tigig from '../assets/images/products/3080tiGigabyte.png';
import imr6900gig from '../assets/images/products/r6900gig.png';
import im2060kfa from '../assets/images/products/2060kfa.png';
import im1660supermsi from '../assets/images/products/1660supermsi.png';
import imr6600msi from '../assets/images/products/r6600msi.png';
import im3090gig from '../assets/images/products/3090gig.png';
import imr6900pc from '../assets/images/products/r6900pc.png';
import im730asus from '../assets/images/products/730asus.png';
import im3060asus from '../assets/images/products/3060asus.png';
import im210msi from '../assets/images/products/210msi.png';
import imr6600asrock from '../assets/images/products/r6600asr.png';
import im3060zotac from '../assets/images/products/3060zotac.png';
import im1030kfa from '../assets/images/products/1030kfa.png';

export default [
    {
        name: 'GIGABYTE GeForce RTX 3070 Ti GAMING OC ',
        price: 78400,
        date: new Date('2022-07-13'),
        vendor: 'Gigabyte',
        stock: 10,
        color: 'black',
        memory: 8,
        fans: '3',
        image: im3070,
    },
    {
        name: 'Palit GeForce RTX 3070 Ti GamingPro',
        price: 72999,
        date: new Date('2022-06-10'),
        vendor: 'Palit',
        stock: 23,
        color: 'rgb',
        memory: 8,
        fans: '3',
        image: im3070palit,
    },
    {
        name: 'PowerColor AMD Radeon RX 6600 Fighter',
        price: 36300,
        date: new Date('2022-07-13'),
        vendor: 'PowerColor',
        stock: 3,
        color: 'black',
        memory: 8,
        fans: '2',
        image: r6600,
    },
    {
        name: 'Palit GeForce RTX 3080 GamingPro (LHR)',
        price: 94500,
        date: new Date('2021-11-01'),
        vendor: 'Palit',
        stock: 2,
        color: 'rgb',
        memory: 12,
        fans: '3',
        image: im3080palit,
    },
    {
        name: 'Palit GeForce RTX 2060 Dual',
        price: 34999,
        date: new Date('2020-08-15'),
        vendor: 'Palit',
        stock: 15,
        color: 'black',
        memory: 12,
        fans: '2',
        image: im2060palit,
    },
    {
        name: 'Palit GeForce RTX 3060 DUAL OC (LHR)',
        price: 49799,
        date: new Date('2021-08-15'),
        vendor: 'Palit',
        stock: 7,
        color: 'black',
        memory: 12,
        fans: '2',
        image: im3060palit,
    },
    {
        name: 'GIGABYTE GeForce RTX 3080 Ti GAMING OC',
        price: 139999,
        date: new Date('2022-03-14'),
        vendor: 'Gigabyte',
        stock: 1,
        color: 'white',
        memory: 12,
        fans: '3',
        image: im3080gig,
    },
    {
        name: 'Palit GeForce GTX 1050 Ti STORMX',
        price: 13999,
        date: new Date('2019-03-10'),
        vendor: 'Palit',
        stock: 100,
        color: 'black',
        memory: 4,
        fans: '1',
        image: im1050palit,
    },
    {
        name: 'MSI GeForce GTX 1660 SUPER Gaming X',
        price: 39999,
        date: new Date('2021-06-21'),
        vendor: 'MSI',
        stock: 11,
        color: 'rgb',
        memory: 6,
        fans: '2',
        image: im1660msi,
    },
    {
        name: 'MSI GeForce RTX 3060 Ti VENTUS 2X OCV1 (LHR)',
        price: 52999,
        date: new Date('2021-12-12'),
        vendor: 'MSI',
        stock: 0,
        color: 'black',
        memory: 8,
        fans: '2',
        image: im3060msi,
    },
    {
        name: 'KFA2 GeForce GTX 1660 SUPER 1-click OC',
        price: 31999,
        date: new Date('2022-04-10'),
        vendor: 'KFA2',
        stock: 39,
        color: 'black',
        memory: 6,
        fans: '2',
        image: im1660kfa,
    },
    {
        name: 'GIGABYTE GeForce RTX 3080 Ti VISION OC',
        price: 119999,
        date: new Date('2022-01-15'),
        vendor: 'Gigabyte',
        stock: 3,
        color: 'white',
        memory: 12,
        fans: '3',
        image: im3080tigig,
    },
    {
        name: 'MSI AMD Radeon RX 550 AERO ITX OC',
        price: 14299,
        date: new Date('2022-03-24'),
        vendor: 'MSI',
        stock: 45,
        color: 'black',
        memory: 4,
        fans: '1',
        image: imr550msi,
    },
    {
        name: 'GIGABYTE AORUS Radeon RX 6900 XT MASTER',
        price: 122999,
        date: new Date('2021-10-13'),
        vendor: 'Gigabyte',
        stock: 3,
        color: 'rgb',
        memory: 16,
        fans: '3',
        image: imr6900gig,
    },
    {
        name: 'KFA2 GeForce RTX 2060 CORE (1-Click OC)',
        price: 41299,
        date: new Date('2022-06-15'),
        vendor: 'KFA2',
        stock: 56,
        color: 'metal',
        memory: 12,
        fans: '2',
        image: im2060kfa,
    },
    {
        name: 'MSI GeForce GTX 1660 SUPER VENTUS XS OC',
        price: 35499,
        date: new Date('2021-09-29'),
        vendor: 'MSI',
        stock: 14,
        color: 'metal',
        memory: 6,
        fans: '2',
        image: im1660supermsi,
    },
    {
        name: 'GIGABYTE AMD Radeon RX 6600 EAGLE',
        price: 33999,
        date: new Date('2021-12-28'),
        vendor: 'Gigabyte',
        stock: 25,
        color: 'gray',
        memory: 8,
        fans: '3',
        image: imr6600msi,
    },
    {
        name: 'GIGABYTE GeForce RTX 3090 TURBO',
        price: 161999,
        date: new Date('2021-10-05'),
        vendor: 'Gigabyte',
        stock: 2,
        color: 'gray',
        memory: 24,
        fans: 'Turbo',
        image: im3090gig,
    },
    {
        name: 'PowerColor AMD Radeon RX 6900 XT Red Devil',
        price: 126999,
        date: new Date('2022-01-27'),
        vendor: 'PowerColor',
        stock: 14,
        color: 'black',
        memory: 16,
        fans: '3',
        image: imr6900pc,
    },
    {
        name: 'ASUS GeForce GT 730 Silent LP',
        price: 5199,
        date: new Date('2020-06-24'),
        vendor: 'Asus',
        stock: 158,
        color: 'black',
        memory: 2,
        fans: 'Passive',
        image: im730asus,
    },
    {
        name: 'ASUS GeForce RTX 3060 PHOENIX (LHR)',
        price: 63499,
        date: new Date('2021-06-28'),
        vendor: 'Asus',
        stock: 0,
        color: 'black',
        memory: 12,
        fans: '1',
        image: im3060asus,
    },
    {
        name: 'MSI GeForce 210',
        price: 3399,
        date: new Date('2018-02-27'),
        vendor: 'MSI',
        stock: 87,
        color: 'black',
        memory: 1,
        fans: '1',
        image: im210msi,
    },
    {
        name: 'ASRock AMD Radeon RX 6600 XT Challenger D OC',
        price: 43299,
        date: new Date('2021-06-19'),
        vendor: 'ASRock',
        stock: 3,
        color: 'black',
        memory: 8,
        fans: '2',
        image: imr6600asrock,
    },
    {
        name: 'ZOTAC GAMING GeForce RTX 3060 Ti AMP LHR White Edition',
        price: 67499,
        date: new Date('2022-01-19'),
        vendor: 'Zotac',
        stock: 5,
        color: 'white',
        memory: 8,
        fans: '2',
        image: im3060zotac,
    },
    {
        name: 'KFA2 GeForce GT 1030',
        price: 6199,
        date: new Date('2022-01-01'),
        vendor: 'KFA2',
        stock: 4,
        color: 'blue',
        memory: 2,
        fans: '1',
        image: im1030kfa,
    },
];
