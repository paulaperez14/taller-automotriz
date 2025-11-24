// Marcas y modelos de vehículos especializados

export const MARCAS_AUTOS = [
    'Mazda',
    'Mercedes-Benz',
    'Toyota',
    'Ferrari',
    'Porsche',
    'Volkswagen',
    'Chevrolet',
    'Buick',
    'GMC',
    'Cadillac',
    'BMW',
    'Ford',
    'Kia',
    'Nissan',
    'Honda',
    'Hyundai',
    'Renault',
    'Audi'
];

export const MARCAS_MOTOS = [
    'Yamaha',
    'Honda',
    'AKT',
    'Suzuki',
    'Kawasaki',
    'Ducati',
    'KTM',
    'Auteco',
    'BMW',
    'Hero',
    'Bajaj'
];

export const MODELOS_POR_MARCA = {
    // AUTOS
    'Mazda': ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'CX-30', 'MX-5 Miata', 'CX-50', 'Mazda2', 'CX-3', 'Tribute', 'MPV', 'Protege', 'Millenia', '626', '929', 'RX-8', 'MX-3', 'Navajo', 'CX-7', 'B-Series'],

    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'GLA', 'GLB', 'GLS', 'A-Class', 'CLA', 'CLS', 'G-Class', 'SL', 'SLC', 'AMG GT', 'Maybach', 'EQS', 'EQE', 'Metris', 'Sprinter'],

    'Toyota': ['Corolla', 'Camry', 'RAV4', 'Highlander', '4Runner', 'Tacoma', 'Tundra', 'Sienna', 'Prius', 'Avalon', 'C-HR', 'Yaris', 'Sequoia', 'Land Cruiser', 'Supra', '86', 'Venza', 'Crown', 'Mirai', 'bZ4X'],

    'Ferrari': ['F8 Tributo', 'SF90 Stradale', 'Roma', '812 Superfast', 'Portofino', 'F8 Spider', 'SF90 Spider', 'LaFerrari', '488 GTB', '488 Spider', '458 Italia', 'California', 'GTC4Lusso', 'FF', '599 GTB', 'Enzo', '430 Scuderia', '360 Modena', 'F12berlinetta', 'Purosangue'],

    'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Boxster', '718 Cayman', '911 Turbo', '911 GT3', 'Cayenne Coupe', 'Macan GTS', 'Panamera Sport Turismo', 'Taycan Cross Turismo', '918 Spyder', 'Carrera GT', 'Boxster', 'Cayman', '944', '928', '968'],

    'Volkswagen': ['Jetta', 'Tiguan', 'Atlas', 'Passat', 'Golf', 'Taos', 'ID.4', 'Arteon', 'Golf GTI', 'Golf R', 'Beetle', 'Touareg', 'CC', 'Eos', 'Routan', 'Phaeton', 'Rabbit', 'Cabrio', 'Polo', 'Up!'],

    'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Traverse', 'Tahoe', 'Suburban', 'Colorado', 'Blazer', 'Trailblazer', 'Trax', 'Camaro', 'Corvette', 'Spark', 'Sonic', 'Cruze', 'Impala', 'Volt', 'Bolt', 'Express', 'Captiva'],

    'Buick': ['Encore', 'Encore GX', 'Envision', 'Enclave', 'Regal', 'LaCrosse', 'Verano', 'Cascada', 'Lucerne', 'Rendezvous', 'Terraza', 'Rainier', 'Century', 'LeSabre', 'Park Avenue', 'Riviera', 'Roadmaster', 'Electra', 'Skyhawk', 'Skylark'],

    'GMC': ['Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD', 'Canyon', 'Acadia', 'Terrain', 'Yukon', 'Yukon XL', 'Hummer EV', 'Savana', 'Envoy', 'Jimmy', 'Sonoma', 'Safari', 'Typhoon', 'Syclone', 'Suburban', 'Denali', 'TopKick', 'W-Series'],

    'Cadillac': ['Escalade', 'XT5', 'XT6', 'XT4', 'CT5', 'CT4', 'Lyriq', 'CT6', 'ATS', 'CTS', 'XTS', 'SRX', 'Eldorado', 'DeVille', 'Seville', 'DTS', 'STS', 'ELR', 'XLR', 'Catera'],

    'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'X1', 'X2', 'X4', 'X6', '2 Series', '4 Series', '8 Series', 'Z4', 'M3', 'M5', 'M8', 'i3', 'i4', 'iX'],

    'Ford': ['F-150', 'Escape', 'Explorer', 'Edge', 'Expedition', 'Ranger', 'Mustang', 'Bronco', 'Bronco Sport', 'EcoSport', 'Maverick', 'Super Duty', 'Transit', 'Mustang Mach-E', 'F-150 Lightning', 'Fusion', 'Taurus', 'Focus', 'Fiesta', 'Crown Victoria'],

    'Kia': ['Seltos', 'Sportage', 'Sorento', 'Telluride', 'Forte', 'K5', 'Soul', 'Rio', 'Stinger', 'Carnival', 'Niro', 'EV6', 'Optima', 'Cadenza', 'Sedona', 'Rondo', 'Spectra', 'Amanti', 'Borrego', 'Magentis'],

    'Nissan': ['Sentra', 'Altima', 'Maxima', 'Rogue', 'Pathfinder', 'Murano', 'Armada', 'Frontier', 'Titan', 'Kicks', 'Versa', 'Leaf', 'Ariya', '370Z', 'GT-R', 'Juke', 'Xterra', 'Quest', 'Cube', 'Rogue Sport'],

    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'Passport', 'Odyssey', 'Ridgeline', 'Insight', 'Clarity', 'Fit', 'CR-Z', 'Element', 'S2000', 'NSX', 'Prelude', 'Del Sol', 'Crosstour', 'CR-V Hybrid', 'Accord Hybrid'],

    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue', 'Accent', 'Veloster', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'Genesis', 'Azera', 'Santa Cruz', 'Nexo', 'Equus', 'Tiburon', 'XG', 'Entourage'],

    'Renault': ['Duster', 'Kwid', 'Logan', 'Sandero', 'Captur', 'Koleos', 'Oroch', 'Stepway', 'Megane', 'Clio', 'Fluence', 'Kangoo', 'Master', 'Scenic', 'Kadjar', 'Talisman', 'Espace', 'Twingo', 'Zoe', 'Arkana'],

    'Audi': ['A3', 'A4', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT', 'R8', 'S3', 'S4', 'S5', 'RS3', 'RS5', 'RS7', 'Q5 Sportback', 'A5 Sportback'],

    // MOTOS
    'Yamaha': ['YZF-R1', 'YZF-R6', 'YZF-R3', 'MT-07', 'MT-09', 'MT-10', 'FZ-07', 'FZ-09', 'FZ6R', 'V-Star 1300', 'V-Star 950', 'Bolt', 'FJR1300', 'Super Ténéré', 'WR250R', 'WR450F', 'YZ450F', 'TTR230', 'Tenere 700', 'XSR700'],

    'Honda': ['CBR1000RR', 'CBR600RR', 'CBR500R', 'CB500F', 'CB650R', 'CB1000R', 'Africa Twin', 'Gold Wing', 'Rebel 500', 'Rebel 1100', 'Fury', 'Shadow', 'CRF450R', 'CRF250R', 'CRF450L', 'XR650L', 'Grom', 'Monkey', 'CB300R', 'CBR300R'],

    'AKT': ['NKD 125', 'RTX 150', 'CR5 180', 'TT 150', 'AK 150', 'EVO R3 150', 'JET 5 150', 'AK 200', 'TT 200', 'NKD 200', 'AK 110', 'JET 4 125', 'DYNAMIC PRO 125', 'FLEX 125', 'SPECIAL 110', 'SPORT 110', 'SL 150', 'AK 125', 'EVO 125', 'CR4 125'],

    'Suzuki': ['GSX-R1000', 'GSX-R750', 'GSX-R600', 'GSX-S1000', 'GSX-S750', 'SV650', 'V-Strom 1050', 'V-Strom 650', 'Hayabusa', 'Boulevard M109R', 'Boulevard C50', 'DR-Z400S', 'RM-Z450', 'RM-Z250', 'DR650S', 'TU250X', 'GW250', 'Katana', 'Burgman 650', 'Burgman 400'],

    'Kawasaki': ['Ninja ZX-10R', 'Ninja ZX-6R', 'Ninja 650', 'Ninja 400', 'Z900', 'Z650', 'Z400', 'Versys 1000', 'Versys 650', 'Vulcan S', 'Vulcan 900', 'KLR650', 'KX450', 'KX250', 'KLX140', 'Teryx', 'Mule', 'Ninja H2', 'W800', 'Z125 Pro'],

    'Ducati': ['Panigale V4', 'Panigale V2', 'Monster', 'Streetfighter V4', 'Streetfighter V2', 'Multistrada V4', 'Multistrada 950', 'Diavel', 'XDiavel', 'Scrambler Icon', 'Scrambler Desert Sled', 'SuperSport', '959 Panigale', '1299 Panigale', 'Hypermotard', 'Hyperstrada', 'Monster 821', 'Monster 1200', 'DesertX', 'Scrambler 1100'],

    'KTM': ['1290 Super Duke R', '890 Duke R', '790 Duke', '390 Duke', '250 Duke', '125 Duke', '1290 Super Adventure', '890 Adventure', '390 Adventure', '250 Adventure', 'RC 390', 'RC 200', '450 SX-F', '250 SX-F', '350 SX-F', '450 XC-F', '500 EXC-F', '690 Enduro R', '690 SMC R', '1290 Super Duke GT'],

    'Auteco': ['Pulsar NS 200', 'Pulsar RS 200', 'Pulsar NS 160', 'Dominar 400', 'Dominar 250', 'Platino 110', 'Discover 125', 'Discover 150', 'CT 100', 'Boxer 150', 'Victory MR 150', 'Victory ONE 110', 'Victory ADVANCE 110', 'Agility 125', 'Agility RS 125', 'Starker 250', 'AK 550', 'AK 200', 'Electric', 'E1'],

    'BMW': ['S 1000 RR', 'S 1000 R', 'M 1000 RR', 'R 1250 GS', 'R 1250 GS Adventure', 'R 1250 RT', 'R 1250 RS', 'F 900 XR', 'F 900 R', 'F 850 GS', 'F 750 GS', 'G 310 R', 'G 310 GS', 'K 1600 GTL', 'R nineT', 'R 18', 'C 400 GT', 'C 400 X', 'CE 04', 'R 1200 GS'],

    'Hero': ['Splendor Plus', 'HF Deluxe', 'Passion Pro', 'Glamour', 'Super Splendor', 'Xtreme 160R', 'Xpulse 200', 'Xpulse 200T', 'Maestro Edge 125', 'Pleasure Plus', 'Destini 125', 'Dash', 'Ignitor', 'Achiever', 'Karizma', 'CBZ', 'Hunk', 'Impulse', 'Thriller', 'Dawn'],

    'Bajaj': ['Pulsar 150', 'Pulsar 180', 'Pulsar NS200', 'Pulsar RS200', 'Pulsar 220F', 'Dominar 400', 'Dominar 250', 'Avenger Street 160', 'Avenger Cruise 220', 'CT 100', 'Platina 100', 'Platina 110', 'Discover 125', 'V15', 'V12', 'Boxer 150', 'Boxer CT', 'Pulsar NS160', 'Pulsar AS150', 'Pulsar NS125']
};

// Función helper para obtener marcas según tipo de vehículo
export const getMarcasPorTipo = (tipoVehiculo) => {
    if (tipoVehiculo === 'MOTOCICLETA') {
        return MARCAS_MOTOS;
    }
    // Para AUTOMOVIL, CAMIONETA, CAMION usamos marcas de autos
    return MARCAS_AUTOS;
};

// Función helper para obtener modelos según marca
export const getModelosPorMarca = (marca) => {
    return MODELOS_POR_MARCA[marca] || [];
};
