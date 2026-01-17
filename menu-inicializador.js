// MENÚ COMPLETO BER-MELY
import { db, doc, setDoc } from './firebase.js';

const menuBerMely = [
    // 🥩 ALGO A LA CARTA
    {
        id: 'rib_eye',
        nombre: 'Rib-eye',
        precio: 300,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'new_york',
        nombre: 'New York',
        precio: 300,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 't_bone',
        nombre: 'T-bone',
        precio: 300,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'sirloin',
        nombre: 'Sirloin',
        precio: 300,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'picana',
        nombre: 'Picaña',
        precio: 270,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'arrachera_carta',
        nombre: 'Arrachera',
        precio: 250,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'costillas_res',
        nombre: 'Costillas de res',
        precio: 120,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'costillas_bermely',
        nombre: 'Costillas de res Ber-Mely',
        precio: 180,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'En vino tinto - Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'chorizo_argentino',
        nombre: 'Chorizo argentino',
        precio: 150,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'chistorra_queso',
        nombre: 'Chistorra con queso',
        precio: 180,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'chori_queso',
        nombre: 'Chori-queso',
        precio: 80,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'pechuga_rellena',
        nombre: 'Pechuga rellena',
        precio: 150,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Jamón, queso manchego y Oaxaca - Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'pechuga_empanizada',
        nombre: 'Pechuga empanizada',
        precio: 130,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },
    {
        id: 'pechuga_plancha',
        nombre: 'Pechuga a la plancha',
        precio: 120,
        categoria: 'carta',
        area: 'cocina',
        descripcion: 'Incluye guacamole, frijoles refritos y cebollitas cambray',
        disponible: true
    },

    // 🌮 TACOS Y OTROS
    {
        id: 'tacos_arrachera',
        nombre: 'Tacos de Arrachera',
        precio: 120,
        categoria: 'tacos',
        area: 'cocina',
        descripcion: 'Orden de 3 tacos - Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'tacos_cecina',
        nombre: 'Tacos de Cecina',
        precio: 130,
        categoria: 'tacos',
        area: 'cocina',
        descripcion: 'Orden de 3 tacos - Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'tacos_bistec',
        nombre: 'Tacos de Bistec',
        precio: 90,
        categoria: 'tacos',
        area: 'cocina',
        descripcion: 'Orden de 3 tacos - Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'tacos_campechanos',
        nombre: 'Tacos Campechanos',
        precio: 90,
        categoria: 'tacos',
        area: 'cocina',
        descripcion: 'Orden de 3 tacos - Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'tacos_pollo',
        nombre: 'Tacos de Pollo',
        precio: 90,
        categoria: 'tacos',
        area: 'cocina',
        descripcion: 'Orden de 3 tacos - Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'tacos_pastor',
        nombre: 'Tacos de Pastor',
        precio: 80,
        categoria: 'tacos',
        area: 'cocina',
        descripcion: 'Orden de 3 tacos - Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'burrito_arrachera',
        nombre: 'Burrito de Arrachera',
        precio: 120,
        categoria: 'burritos',
        area: 'cocina',
        descripcion: 'Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'burrito_bistec',
        nombre: 'Burrito de Bistec',
        precio: 100,
        categoria: 'burritos',
        area: 'cocina',
        descripcion: 'Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'burrito_chorizo',
        nombre: 'Burrito de Chorizo',
        precio: 90,
        categoria: 'burritos',
        area: 'cocina',
        descripcion: 'Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'burrito_pastor',
        nombre: 'Burrito de Pastor',
        precio: 90,
        categoria: 'burritos',
        area: 'cocina',
        descripcion: 'Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'alambre_arrachera',
        nombre: 'Alambre de Arrachera',
        precio: 160,
        categoria: 'alambres',
        area: 'cocina',
        descripcion: 'Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'alambre_fortachon',
        nombre: 'Alambre Fortachón',
        precio: 130,
        categoria: 'alambres',
        area: 'cocina',
        descripcion: 'Arrachera, tocino, chorizo, champiñón - Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'alambre_bistec',
        nombre: 'Alambre de Bistec',
        precio: 120,
        categoria: 'alambres',
        area: 'cocina',
        descripcion: 'Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'alambre_pastor',
        nombre: 'Alambre de Pastor',
        precio: 100,
        categoria: 'alambres',
        area: 'cocina',
        descripcion: 'Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },
    {
        id: 'alambre_pollo',
        nombre: 'Alambre de Pollo',
        precio: 100,
        categoria: 'alambres',
        area: 'cocina',
        descripcion: 'Incluye papas a la francesa y cebolla fileteada',
        disponible: true
    },

    // 🌭 HOT DOGS
    {
        id: 'hotdog_sencillo',
        nombre: 'Hot Dog Sencillo',
        precio: 55,
        categoria: 'hotdogs',
        area: 'cocina',
        descripcion: 'Hot dog clásico',
        disponible: true
    },
    {
        id: 'hotdog_hawaiano',
        nombre: 'Hot Dog Hawaiano',
        precio: 65,
        categoria: 'hotdogs',
        area: 'cocina',
        descripcion: 'Piña y queso',
        disponible: true
    },
    {
        id: 'hotdog_especial',
        nombre: 'Hot Dog Especial',
        precio: 70,
        categoria: 'hotdogs',
        area: 'cocina',
        descripcion: 'Tocino, jamón y queso',
        disponible: true
    },

    // 🍔 HAMBURGUESAS + PAPAS
    {
        id: 'hamburguesa_res',
        nombre: 'Hamburguesa de Res',
        precio: 100,
        categoria: 'hamburguesas',
        area: 'cocina',
        descripcion: 'Jamón y queso manchego - Incluye papas',
        disponible: true
    },
    {
        id: 'hamburguesa_hawaiana',
        nombre: 'Hamburguesa Hawaiana',
        precio: 120,
        categoria: 'hamburguesas',
        area: 'cocina',
        descripcion: 'Incluye papas',
        disponible: true
    },
    {
        id: 'hamburguesa_pollo',
        nombre: 'Hamburguesa de Pollo',
        precio: 150,
        categoria: 'hamburguesas',
        area: 'cocina',
        descripcion: 'Incluye papas',
        disponible: true
    },
    {
        id: 'hamburguesa_especial',
        nombre: 'Hamburguesa Especial',
        precio: 170,
        categoria: 'hamburguesas',
        area: 'cocina',
        descripcion: 'Tocino, quesos, habanero, cebolla y champiñón - Incluye papas',
        disponible: true
    },
    {
        id: 'hamburguesa_arrachera',
        nombre: 'Hamburguesa de Arrachera',
        precio: 170,
        categoria: 'hamburguesas',
        area: 'cocina',
        descripcion: 'Incluye papas',
        disponible: true
    },

    // 🥗 ENSALADAS
    {
        id: 'ensalada_bermely',
        nombre: 'Ensalada Ber-Mely',
        precio: 140,
        categoria: 'ensaladas',
        area: 'cocina',
        descripcion: 'Ensalada especial de la casa',
        disponible: true
    },
    {
        id: 'ensalada_primavera',
        nombre: 'Ensalada Primavera',
        precio: 130,
        categoria: 'ensaladas',
        area: 'cocina',
        descripcion: 'Ensalada fresca con vegetales de temporada',
        disponible: true
    },
    {
        id: 'ensalada_campestre',
        nombre: 'Ensalada Campestre',
        precio: 110,
        categoria: 'ensaladas',
        area: 'cocina',
        descripcion: 'Ensalada estilo rústico',
        disponible: true
    },

    // 🍟 SNACK
    {
        id: 'club_sandwich',
        nombre: 'Club Sándwich',
        precio: 130,
        categoria: 'snack',
        area: 'cocina',
        descripcion: 'Pollo, jamón y tocino',
        disponible: true
    },
    {
        id: 'alitas',
        nombre: 'Alitas (6 pzs)',
        precio: 80,
        categoria: 'snack',
        area: 'cocina',
        descripcion: '6 piezas de alitas',
        disponible: true
    },
    {
        id: 'boneless',
        nombre: 'Boneless',
        precio: 90,
        categoria: 'snack',
        area: 'cocina',
        descripcion: 'Boneless de pollo',
        disponible: true
    },
    {
        id: 'papas_francesas',
        nombre: 'Papas a la francesa',
        precio: 60,
        categoria: 'snack',
        area: 'cocina',
        descripcion: 'Porción de papas a la francesa',
        disponible: true
    },
    {
        id: 'nachos',
        nombre: 'Nachos',
        precio: 60,
        categoria: 'snack',
        area: 'cocina',
        descripcion: 'Nachos con queso',
        disponible: true
    },
    {
        id: 'nachos_chori_queso',
        nombre: 'Nachos con chori-queso',
        precio: 80,
        categoria: 'snack',
        area: 'cocina',
        descripcion: 'Nachos con chori-queso',
        disponible: true
    },

    // 🍳 DESAYUNOS
    {
        id: 'chilaquiles_sencillos',
        nombre: 'Chilaquiles Sencillos',
        precio: 80,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Verdes o rojos - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'chilaquiles_huevo',
        nombre: 'Chilaquiles con Huevo',
        precio: 90,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Verdes o rojos - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'chilaquiles_pechuga',
        nombre: 'Chilaquiles con Pechuga',
        precio: 110,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Verdes o rojos - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'chilaquiles_bistec',
        nombre: 'Chilaquiles con Bistec',
        precio: 120,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Con bistec, costilla o cecina - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'enchiladas',
        nombre: 'Enchiladas',
        precio: 80,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Enfrijoladas / Enchiladas - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'enchiladas_suizas',
        nombre: 'Enchiladas Suizas',
        precio: 100,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Suizas / Enmoladas - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'huevos_al_gusto',
        nombre: 'Huevos al Gusto',
        precio: 80,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Jamón, tocino, salchicha, chorizo o mexicana - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'huevos_divorciados',
        nombre: 'Huevos Divorciados',
        precio: 80,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Divorciados / Estrellados - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'huevos_rancheros',
        nombre: 'Huevos Rancheros Ber-Mely',
        precio: 100,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Rancheros estilo Ber-Mely - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'omelette_clasico',
        nombre: 'Omelette Clásico',
        precio: 90,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Omelette tradicional - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'omelette_champinon',
        nombre: 'Omelette de Champiñón',
        precio: 100,
        categoria: 'desayunos',
        area: 'cocina',
        descripcion: 'Champiñón o espinaca - Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'molletes_clasicos',
        nombre: 'Molletes Clásicos',
        precio: 80,
        categoria: 'desayunos',
        area: 'cafeteria',
        descripcion: 'Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'molletes_hawaianos',
        nombre: 'Molletes Hawaianos',
        precio: 90,
        categoria: 'desayunos',
        area: 'cafeteria',
        descripcion: 'Incluye fruta, café o té',
        disponible: true
    },
    {
        id: 'molletes_argentinos',
        nombre: 'Molletes Argentinos',
        precio: 100,
        categoria: 'desayunos',
        area: 'cafeteria',
        descripcion: 'Argentinos / Chistosos - Incluye fruta, café o té',
        disponible: true
    },

    // 🍽️ MENÚ EJECUTIVO
    {
        id: 'menu_ejecutivo',
        nombre: 'Menú Ejecutivo',
        precio: 80,
        categoria: 'ejecutivo',
        area: 'cocina',
        descripcion: 'Sopa o consomé, arroz/pasta/ensalada y comida del día',
        disponible: true
    },

    // 🥞 LA CREPERÍA - SALADAS CON QUESO
    {
        id: 'crepa_jamon',
        nombre: 'Crepas de Jamón con Queso',
        precio: 100,
        categoria: 'crepas_saladas',
        area: 'cafeteria',
        descripcion: 'Saladas con queso',
        disponible: true
    },
    {
        id: 'crepa_champinon',
        nombre: 'Crepas de Champiñones con Queso',
        precio: 100,
        categoria: 'crepas_saladas',
        area: 'cafeteria',
        descripcion: 'Saladas con queso',
        disponible: true
    },
    {
        id: 'crepa_atun',
        nombre: 'Crepas de Atún con Queso',
        precio: 100,
        categoria: 'crepas_saladas',
        area: 'cafeteria',
        descripcion: 'Saladas con queso',
        disponible: true
    },
    {
        id: 'crepa_pepperoni',
        nombre: 'Crepas de Pepperoni con Queso',
        precio: 100,
        categoria: 'crepas_saladas',
        area: 'cafeteria',
        descripcion: 'Saladas con queso',
        disponible: true
    },

    // 🥞 LA CREPERÍA - ESPECIALES SALADAS
    {
        id: 'crepa_classic',
        nombre: 'Crepas Classic',
        precio: 115,
        categoria: 'crepas_especiales',
        area: 'cafeteria',
        descripcion: 'Especial salada',
        disponible: true
    },
    {
        id: 'crepa_chapis',
        nombre: 'Crepas Chapis',
        precio: 115,
        categoria: 'crepas_especiales',
        area: 'cafeteria',
        descripcion: 'Especial salada',
        disponible: true
    },
    {
        id: 'crepa_bermely',
        nombre: 'Crepas Ber-Mely',
        precio: 115,
        categoria: 'crepas_especiales',
        area: 'cafeteria',
        descripcion: 'Especial salada',
        disponible: true
    },
    {
        id: 'crepa_hawaiana',
        nombre: 'Crepas Hawaiana',
        precio: 115,
        categoria: 'crepas_especiales',
        area: 'cafeteria',
        descripcion: 'Especial salada',
        disponible: true
    },
    {
        id: 'crepa_poblana',
        nombre: 'Crepas Poblana',
        precio: 115,
        categoria: 'crepas_especiales',
        area: 'cafeteria',
        descripcion: 'Especial salada',
        disponible: true
    },

    // 🥞 LA CREPERÍA - DULCES
    {
        id: 'crepa_cajeta_platano',
        nombre: 'Crepas de Cajeta con Plátano',
        precio: 80,
        categoria: 'crepas_dulces',
        area: 'cafeteria',
        descripcion: 'Crepas dulces',
        disponible: true
    },
    {
        id: 'crepa_nutella_queso',
        nombre: 'Crepas de Nutella con Queso',
        precio: 80,
        categoria: 'crepas_dulces',
        area: 'cafeteria',
        descripcion: 'Crepas dulces',
        disponible: true
    },
    {
        id: 'crepa_lechera_nuez',
        nombre: 'Crepas de Lechera con Nuez',
        precio: 80,
        categoria: 'crepas_dulces',
        area: 'cafeteria',
        descripcion: 'Crepas dulces',
        disponible: true
    },
    {
        id: 'crepa_mermelada',
        nombre: 'Crepas con Mermelada',
        precio: 80,
        categoria: 'crepas_dulces',
        area: 'cafeteria',
        descripcion: 'Crepas con mermelada',
        disponible: true
    },

    // 🥞 LA CREPERÍA - ESPECIALES DULCES
    {
        id: 'crepa_especial_frutas',
        nombre: 'Crepas Especial de Frutas',
        precio: 95,
        categoria: 'crepas_especiales_dulces',
        area: 'cafeteria',
        descripcion: 'Frutas, Nutella y queso Philadelphia',
        disponible: true
    },

    // 🥞 LA CREPERÍA - CON CHOCOLATE
    {
        id: 'crepa_kinder_buu',
        nombre: 'Crepas Kinder Buu',
        precio: 100,
        categoria: 'crepas_chocolate',
        area: 'cafeteria',
        descripcion: 'Crepas con chocolate',
        disponible: true
    },
    {
        id: 'crepa_kinder_delice',
        nombre: 'Crepas Kinder Delice',
        precio: 100,
        categoria: 'crepas_chocolate',
        area: 'cafeteria',
        descripcion: 'Crepas con chocolate',
        disponible: true
    },
    {
        id: 'crepa_roshe',
        nombre: 'Crepas Roshe',
        precio: 100,
        categoria: 'crepas_chocolate',
        area: 'cafeteria',
        descripcion: 'Crepas con chocolate',
        disponible: true
    },

    // 🥞 LA CREPERÍA - CON LICOR
    {
        id: 'crepa_coronado',
        nombre: 'Crepas Coronado',
        precio: 110,
        categoria: 'crepas_licor',
        area: 'cafeteria',
        descripcion: 'Crepas con licor',
        disponible: true
    },
    {
        id: 'crepa_khala',
        nombre: 'Crepas Khala',
        precio: 110,
        categoria: 'crepas_licor',
        area: 'cafeteria',
        descripcion: 'Crepas con licor',
        disponible: true
    },
    {
        id: 'crepa_baileys',
        nombre: 'Crepas Baileys',
        precio: 110,
        categoria: 'crepas_licor',
        area: 'cafeteria',
        descripcion: 'Crepas con licor',
        disponible: true
    },
    {
        id: 'crepa_malibu',
        nombre: 'Crepas Malibú',
        precio: 110,
        categoria: 'crepas_licor',
        area: 'cafeteria',
        descripcion: 'Crepas con licor',
        disponible: true
    },
    {
        id: 'crepa_amaretto',
        nombre: 'Crepas Amaretto',
        precio: 110,
        categoria: 'crepas_licor',
        area: 'cafeteria',
        descripcion: 'Crepas con licor',
        disponible: true
    }
];

// BEBIDAS - Por agregar después
const bebidasBerMely = [
    {
        id: 'cafe_americano',
        nombre: 'Café Americano',
        precio: 40,
        categoria: 'bebidas_calientes',
        area: 'cafeteria',
        descripcion: 'Café negro americano',
        disponible: true
    },
    {
        id: 'cafe_capuchino',
        nombre: 'Capuchino',
        precio: 50,
        categoria: 'bebidas_calientes',
        area: 'cafeteria',
        descripcion: 'Capuchino clásico',
        disponible: true
    },
    {
        id: 'cafe_expreso',
        nombre: 'Café Expreso',
        precio: 45,
        categoria: 'bebidas_calientes',
        area: 'cafeteria',
        descripcion: 'Café expreso',
        disponible: true
    },
    {
        id: 'te',
        nombre: 'Té',
        precio: 35,
        categoria: 'bebidas_calientes',
        area: 'cafeteria',
        descripcion: 'Té de hierbas',
        disponible: true
    },
    {
        id: 'refresco',
        nombre: 'Refresco',
        precio: 30,
        categoria: 'bebidas_frias',
        area: 'cafeteria',
        descripcion: 'Refresco de 600ml',
        disponible: true
    },
    {
        id: 'agua',
        nombre: 'Agua',
        precio: 25,
        categoria: 'bebidas_frias',
        area: 'cafeteria',
        descripcion: 'Agua natural',
        disponible: true
    },
    {
        id: 'agua_sabor',
        nombre: 'Agua de Sabor',
        precio: 35,
        categoria: 'bebidas_frias',
        area: 'cafeteria',
        descripcion: 'Agua de sabor natural',
        disponible: true
    },
    {
        id: 'jugo_natural',
        nombre: 'Jugo Natural',
        precio: 45,
        categoria: 'bebidas_frias',
        area: 'cafeteria',
        descripcion: 'Jugo de naranja o piña',
        disponible: true
    },
    {
        id: 'licuado',
        nombre: 'Licuado',
        precio: 55,
        categoria: 'bebidas_frias',
        area: 'cafeteria',
        descripcion: 'Licuado de frutas',
        disponible: true
    },
    {
        id: 'malteada',
        nombre: 'Malteada',
        precio: 60,
        categoria: 'bebidas_frias',
        area: 'cafeteria',
        descripcion: 'Malteada de chocolate, vainilla o fresa',
        disponible: true
    }
];

// Función para inicializar el menú
async function inicializarMenuBerMely() {
    try {
        console.log('Inicializando menú Ber-Mely...');
        
        let contador = 0;
        
        // Agregar platillos
        for (const producto of menuBerMely) {
            await setDoc(doc(db, 'menu', producto.id), producto);
            contador++;
        }
        
        // Agregar bebidas
        for (const bebida of bebidasBerMely) {
            await setDoc(doc(db, 'menu', bebida.id), bebida);
            contador++;
        }
        
        console.log(`✅ Menú Ber-Mely inicializado con ${contador} productos`);
        return true;
        
    } catch (error) {
        console.error('❌ Error inicializando menú Ber-Mely:', error);
        return false;
    }
}

// Exportar para usar en otros archivos
export {
    menuBerMely,
    bebidasBerMely,
    inicializarMenuBerMely
};

// Si se ejecuta directamente, inicializar el menú
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async function() {
        // Solo inicializar en páginas específicas
        if (window.location.pathname.includes('index.html') || 
            window.location.pathname.includes('admin.html')) {
            
            // Verificar si ya existe menú
            const { collection, getDocs } = await import('./firebase.js');
            const menuSnapshot = await getDocs(collection(db, 'menu'));
            
            if (menuSnapshot.empty) {
                await inicializarMenuBerMely();
            }
        }
    });
}