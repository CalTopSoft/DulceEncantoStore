/* ============ Datos del prototipo (todo estático) ============ */
window.DE = window.DE || {};

DE.INK = '#4a2f55';

/* ---- Productos ---- */
DE.products = [
  // PASTELES
  {id:'p1', name:'Torta Triple Chocolate', cat:'pasteles', price:28, avail:'encargo', rating:4.9, reviews:128, tags:['Más pedido'],
   desc:'Bizcocho húmedo de cacao, ganache de chocolate 70 % y crema de chocolate. Para 12 porciones.',
   ingredients:'Cacao Arriba, mantequilla, huevos, harina, azúcar, crema de leche.',
   art:{type:'layer', c:['#8b5a46','#b98368','#e0708f','#fff']}, bg:'#fcd9e1'},
  {id:'p2', name:'Red Velvet Clásica', cat:'pasteles', price:32, avail:'encargo', rating:4.8, reviews:96, tags:['Más pedido'],
   desc:'Capas rojas suaves con frosting de queso crema y un toque de vainilla. Para 12 porciones.',
   ingredients:'Harina, suero de leche, cacao, queso crema, vainilla, mantequilla.',
   art:{type:'layer', c:['#c4455f','#ffffff','#e0708f','#ffd9e0']}, bg:'#fff0f3'},
  {id:'p3', name:'Tres Leches de Maracuyá', cat:'pasteles', price:26, avail:'hoy', rating:4.9, reviews:154, tags:['Más pedido'],
   desc:'Bizcocho esponjoso bañado en tres leches con coulis de maracuyá y crema chantilly.',
   ingredients:'Leche entera, leche condensada, leche evaporada, maracuyá, crema chantilly.',
   art:{type:'layer', c:['#f6dca0','#ffffff','#f7b733','#f7cf9b']}, bg:'#fdefd9'},
  {id:'p4', name:'Torta de Zanahoria y Nueces', cat:'pasteles', price:27, avail:'encargo', rating:4.7, reviews:61, tags:[],
   desc:'Especiada con canela y jengibre, rellena de crema de queso y nueces caramelizadas.',
   ingredients:'Zanahoria, nueces, canela, jengibre, queso crema, azúcar morena.',
   art:{type:'layer', c:['#e6a05b','#fff3df','#c47a2c','#fff']}, bg:'#e8f0dc'},
  {id:'p5', name:'Naked Cake de Frutos Rojos', cat:'pasteles', price:34, avail:'encargo', rating:4.8, reviews:43, tags:['Nuevo'],
   desc:'Bizcocho de vainilla con crema ligera de mascarpone, fresas, moras y frambuesas frescas.',
   ingredients:'Mascarpone, fresas, mora de Castilla, frambuesas, vainilla, mantequilla.',
   art:{type:'layer', c:['#f6dca0','#fff8ef','#d9456a','#7a4fb3']}, bg:'#ece4f8'},

  // POSTRES
  {id:'p6', name:'Cupcakes de Vainilla (x6)', cat:'postres', price:9.5, avail:'hoy', rating:4.8, reviews:210, tags:['Más pedido'],
   desc:'Seis cupcakes con buttercream de colores pastel, ideales para oficina o regalo.',
   ingredients:'Harina, mantequilla, vainilla, huevos, buttercream.',
   art:{type:'cupcake', c:['#f6dca0','#ffc2cf','#e0708f','#c9b8e8']}, bg:'#ece4f8'},
  {id:'p7', name:'Macarons Pastel (x6)', cat:'postres', price:8.5, avail:'hoy', rating:4.9, reviews:87, tags:[],
   desc:'Frambuesa, pistacho y vainilla. Crujientes por fuera, suaves por dentro. Sin gluten.',
   ingredients:'Almendra, claras, azúcar, ganache, pulpa de frutas.',
   art:{type:'macarons', c:['#ffc2cf','#cfe5bd','#d9c8f2','#fff']}, bg:'#fff0f3'},
  {id:'p8', name:'Tartaleta de Limón', cat:'postres', price:4.8, avail:'hoy', rating:4.7, reviews:58, tags:[],
   desc:'Base crocante de mantequilla, curd de limón sutil y merengue flameado.',
   ingredients:'Limón sutil, mantequilla, harina, huevos, azúcar.',
   art:{type:'tart', c:['#e8b96b','#fbe27a','#fff','#cfe5bd']}, bg:'#e8f0dc'},
  {id:'p9', name:'Tarta de Frutas Frescas', cat:'postres', price:14, avail:'encargo', rating:4.8, reviews:72, tags:['Temporada'],
   desc:'Crema pastelera de vainilla sobre masa sablée con frutas de estación y brillo de albaricoque.',
   ingredients:'Fresas, kiwi, mora, crema pastelera, masa sablée.',
   art:{type:'tart', c:['#e8b96b','#fff3d6','#e0455f','#7a4fb3']}, bg:'#fdefd9'},
  {id:'p10', name:'Flan de Coco', cat:'postres', price:4.2, avail:'hoy', rating:4.6, reviews:39, tags:[],
   desc:'Flan cremoso de coco rallado con caramelo dorado. Receta de la abuela.',
   ingredients:'Coco, leche, huevos, azúcar, vainilla.',
   art:{type:'flan', c:['#fff1d2','#fff','#c47a2c','#fff']}, bg:'#e3eef9'},
  {id:'p11', name:'Brownies con Nueces (x4)', cat:'postres', price:7, avail:'hoy', rating:4.9, reviews:101, tags:['Sin gluten'],
   desc:'Densos, brillantes y con nueces tostadas. Pura intensidad de chocolate.',
   ingredients:'Chocolate semiamargo, nueces, mantequilla, huevos, cacao.',
   art:{type:'brownie', c:['#6b402f','#8b5a46','#e8b96b','#fff']}, bg:'#fcd9e1'},

  // PORCIONES
  {id:'p12', name:'Porción de Chocolate', cat:'porciones', price:3.5, avail:'hoy', rating:4.9, reviews:176, tags:['Del día'],
   desc:'La favorita de la casa: tres capas de cacao y ganache.',
   ingredients:'Cacao, mantequilla, huevos, crema de leche.',
   art:{type:'slice', c:['#8b5a46','#b98368','#e0708f','#fff']}, bg:'#fdefd9'},
  {id:'p13', name:'Porción Red Velvet', cat:'porciones', price:3.8, avail:'hoy', rating:4.8, reviews:132, tags:['Del día'],
   desc:'Rojo intenso, suave y con queso crema. Se derrite en la boca.',
   ingredients:'Suero de leche, cacao, queso crema, vainilla.',
   art:{type:'slice', c:['#c4455f','#ffffff','#e0708f','#fff']}, bg:'#fff0f3'},
  {id:'p14', name:'Porción Cheesecake de Mora', cat:'porciones', price:4, avail:'hoy', rating:4.9, reviews:118, tags:['Del día'],
   desc:'Base de galleta, queso crema horneado lento y salsa de mora de Castilla.',
   ingredients:'Queso crema, galleta, mora de Castilla, mantequilla.',
   art:{type:'slice', c:['#fff1d2','#e8d5f7','#7a4fb3','#fff']}, bg:'#ece4f8'},
  {id:'p15', name:'Porción Tres Leches', cat:'porciones', price:3.2, avail:'agotado', rating:4.9, reviews:164, tags:['Del día'],
   desc:'Esponjosa y jugosa, con crema chantilly y canela.',
   ingredients:'Tres leches, huevos, harina, crema chantilly.',
   art:{type:'slice', c:['#f6dca0','#ffffff','#f7b733','#fff']}, bg:'#e8f0dc'},
  {id:'p16', name:'Porción de Zanahoria', cat:'porciones', price:3.4, avail:'hoy', rating:4.7, reviews:54, tags:['Del día'],
   desc:'Húmeda, especiada y con crema de queso. Con nueces.',
   ingredients:'Zanahoria, nueces, canela, queso crema.',
   art:{type:'slice', c:['#e6a05b','#fff3df','#c47a2c','#fff']}, bg:'#e3eef9'}
];

/* ---- Opciones de tortas personalizadas ---- */
DE.cfg = {
  sizes:[{id:'8', label:'Pequeña · 8 porciones', price:24, tiers:2},
         {id:'12', label:'Mediana · 12 porciones', price:34, tiers:2},
         {id:'20', label:'Grande · 20 porciones', price:52, tiers:3}],
  flavors:[{id:'vainilla', label:'Vainilla', extra:0, color:'#f6dca0'},
           {id:'chocolate', label:'Chocolate', extra:2, color:'#8b5a46'},
           {id:'redvelvet', label:'Red velvet', extra:4, color:'#c4455f'},
           {id:'tresleches', label:'Tres leches', extra:2, color:'#f4e6c4'},
           {id:'zanahoria', label:'Zanahoria', extra:1, color:'#e6a05b'}],
  fillings:[{id:'manjar', label:'Manjar de leche'}, {id:'fresas', label:'Fresas'}, {id:'mora', label:'Mora de Castilla'},
            {id:'maracuya', label:'Crema de maracuyá'}, {id:'ganache', label:'Ganache de chocolate'}, {id:'nueces', label:'Nueces'}],
  designs:[{id:'cumple', label:'Cumpleaños', extra:4}, {id:'boda', label:'Boda', extra:18},
           {id:'infantil', label:'Infantil', extra:6}, {id:'minimal', label:'Minimalista', extra:0}],
  colors:[{id:'rosa', label:'Rosa', hex:'#ffc2cf'}, {id:'lila', label:'Lila', hex:'#d9c8f2'}, {id:'blanco', label:'Blanco', hex:'#ffffff'},
          {id:'celeste', label:'Celeste', hex:'#c4def4'}, {id:'menta', label:'Menta', hex:'#cfe5bd'}],
  freeFillings:2, fillingPrice:1.5, msgPrice:2
};

/* ---- Códigos promocionales ---- */
DE.promos = {
  DULCE10:    {label:'10 % de descuento', type:'pct', value:.10},
  CUMPLE5:    {label:'$5 de descuento en compras desde $30', type:'flat', value:5, min:30},
  ENVIOGRATIS:{label:'Delivery gratis', type:'ship'}
};

/* ---- Sucursales ---- */
DE.branches = [
  {id:'centro', name:'Dulce Encanto Centro', addr:'Av. 9 de Octubre y Boyacá, Guayaquil', hours:'Lun–Sáb 9:00–19:00 · Dom 10:00–14:00', phone:'04 230 1122', x:42, y:55},
  {id:'urdesa', name:'Dulce Encanto Urdesa', addr:'V. E. Estrada 123 y Ebanos, Urdesa', hours:'Lun–Sáb 9:00–20:00 · Dom 10:00–15:00', phone:'04 238 4455', x:30, y:28},
  {id:'sambo',  name:'Dulce Encanto Samborondón', addr:'C. C. Plaza Lagos, local 14, Samborondón', hours:'Todos los días 10:00–20:00', phone:'04 283 7788', x:72, y:30}
];
DE.zones = {norte:{label:'Norte (Urdesa, Kennedy, Alborada)', fee:2.5}, centro:{label:'Centro', fee:2}, sur:{label:'Sur', fee:3}, sambo:{label:'Samborondón / Vía a la Costa', fee:4}};

/* ---- Reseñas ---- */
DE.reviews = [
  {n:'María Fernanda L.', r:5, t:'La torta de cumpleaños de mi hija quedó idéntica al diseño que elegí. Llegó puntual y a todos les encantó.', w:'Torta personalizada'},
  {n:'Andrés P.', r:5, t:'Pedí desde el celular en dos minutos y me llegó confirmación por WhatsApp. Las porciones de red velvet, adictivas.', w:'Porciones del día'},
  {n:'Carolina V.', r:4, t:'Compramos cupcakes para la oficina. Se acabaron antes del mediodía. El delivery llegó un poquito tarde, pero avisaron.', w:'Cupcakes x6'},
  {n:'Daniela R.', r:5, t:'Los macarons son de otro nivel. Y el blog tiene recetas que sí funcionan, ya hice el flan de coco.', w:'Macarons pastel'}
];

/* ---- Blog ---- */
DE.blogCats = [
  {id:'recetas', label:'Recetas', color:'rose'},
  {id:'preparacion', label:'Preparación de postres', color:'sun'},
  {id:'tendencias', label:'Tendencias', color:'lilac'},
  {id:'novedades', label:'Novedades de repostería', color:'sky'},
  {id:'consejos', label:'Consejos', color:'mint'},
  {id:'recomendaciones', label:'Recomendaciones de repostería', color:'rose'},
  {id:'entrevistas', label:'Entrevistas', color:'sun'},
  {id:'negocio', label:'Novedades del negocio', color:'lilac'}
];
DE.posts = [
  {id:'b1', cat:'recetas', title:'Flan de coco cremoso en 5 pasos', date:'8 nov 2026', read:'6 min', isNew:true, art:{type:'flan', c:['#fff1d2','#fff','#c47a2c','#fff']}, bg:'#e3eef9',
   excerpt:'La receta de la casa: sin burbujas, sin grietas y con caramelo perfecto.',
   body:['<p>El secreto del flan perfecto es la paciencia y el baño maría. Esta receta rinde 8 porciones.</p>','<ul><li>1 lata de leche condensada</li><li>1 lata de leche evaporada</li><li>4 huevos y 1 taza de coco rallado</li><li>1 taza de azúcar para el caramelo</li></ul>','<p>Haz el caramelo a fuego medio sin revolver, viértelo en el molde y deja endurecer. Licúa el resto, cuela dos veces y hornea a baño maría 50 minutos a 160 °C. Enfría toda la noche antes de desmoldar.</p>']},
  {id:'b2', cat:'recetas', title:'Brownies de cacao Arriba con nueces', date:'1 nov 2026', read:'5 min', art:{type:'brownie', c:['#6b402f','#8b5a46','#e8b96b','#fff']}, bg:'#fcd9e1',
   excerpt:'Densos, brillantes y con la corteza crujiente que todos buscan.',
   body:['<p>Usa chocolate de calidad: marca toda la diferencia. Bate los huevos con el azúcar hasta que doblen su volumen; esa es la clave de la corteza brillante.</p>','<p>Hornea a 175 °C por 22–25 minutos. Debe salir con migas húmedas en el palillo, no limpio.</p>']},
  {id:'b3', cat:'preparacion', title:'Cómo montar una torta de tres pisos', date:'5 nov 2026', read:'8 min', art:{type:'layer', c:['#f6dca0','#ffffff','#e0708f','#ffd9e0']}, bg:'#fdefd9',
   excerpt:'Soportes, rellenos y nivelado: lo básico para que no se incline.',
   body:['<p>Antes de decorar, nivela cada piso con un cuchillo de sierra y enfría los bizcochos al menos dos horas.</p>','<ol><li>Coloca un disco de cartón bajo cada piso.</li><li>Inserta pajillas o varillas para sostener el peso.</li><li>Aplica una capa fina de crema («crumb coat») y refrigera 20 minutos.</li><li>Termina con la capa final y decora.</li></ol>']},
  {id:'b4', cat:'preparacion', title:'Merengue suizo sin lágrimas', date:'27 oct 2026', read:'4 min', art:{type:'tart', c:['#e8b96b','#fbe27a','#fff','#cfe5bd']}, bg:'#e8f0dc',
   excerpt:'Temperatura, tiempo y un bowl bien limpio.',
   body:['<p>Bate claras y azúcar sobre baño maría hasta 65 °C. Retira y bate a velocidad alta hasta picos firmes y brillantes. Un bowl con rastros de grasa arruina todo: límpialo con limón.</p>']},
  {id:'b5', cat:'tendencias', title:'Tortas minimalistas: menos es más', date:'3 nov 2026', read:'4 min', art:{type:'layer', c:['#f6dca0','#fff8ef','#d9456a','#7a4fb3']}, bg:'#ece4f8',
   excerpt:'Frosting liso, flores comestibles y paletas suaves dominan este año.',
   body:['<p>Las tortas «naked» y los acabados texturizados con espátula siguen en auge. Se combinan con flores frescas, frutos rojos y tonos tierra.</p><p>Si buscas algo así, elige «Minimalista» en nuestro personalizador.</p>']},
  {id:'b6', cat:'tendencias', title:'Sabores de Navidad 2026', date:'29 oct 2026', read:'5 min', art:{type:'cupcake', c:['#f6dca0','#ffc2cf','#e0708f','#c9b8e8']}, bg:'#ece4f8',
   excerpt:'Jengibre, ron pasas, café y chocolate blanco con arándanos.',
   body:['<p>Este año vemos regreso de sabores especiados y mezclas con café ecuatoriano. En diciembre abrimos reservas de nuestra campaña «Navidad Dulce».</p>']},
  {id:'b7', cat:'novedades', title:'Macarons sin gluten: ¿por qué funcionan?', date:'20 oct 2026', read:'5 min', art:{type:'macarons', c:['#ffc2cf','#cfe5bd','#d9c8f2','#fff']}, bg:'#fff0f3',
   excerpt:'La harina de almendra es aliada de personas con celiaquía.',
   body:['<p>Los macarons se hacen con harina de almendra, azúcar glas y claras, sin harina de trigo. Confirma siempre con tu pastelero que no haya contaminación cruzada.</p>']},
  {id:'b8', cat:'consejos', title:'5 consejos para que tu bizcocho no se seque', date:'6 nov 2026', read:'4 min', art:{type:'slice', c:['#f6dca0','#ffffff','#f7b733','#fff']}, bg:'#e8f0dc',
   excerpt:'Medidas exactas, horno precalentado y un buen almíbar.',
   body:['<ul><li>Pesa los ingredientes, no los midas «a ojo».</li><li>Precalienta el horno 15 minutos.</li><li>No abras la puerta antes de los 25 minutos.</li><li>Humedece con almíbar ligero.</li><li>Guarda tapado y a temperatura ambiente.</li></ul>']},
  {id:'b9', cat:'consejos', title:'Cómo conservar tu torta hasta la fiesta', date:'22 oct 2026', read:'3 min', art:{type:'layer', c:['#8b5a46','#b98368','#e0708f','#fff']}, bg:'#fcd9e1',
   excerpt:'Refrigeración, transporte y cuánto antes sacarla.',
   body:['<p>Refrigera hasta 2 horas antes de servir; el frosting de mantequilla necesita ese tiempo a temperatura ambiente para suavizar. En el carro, transporta sobre una superficie plana y con el aire acondicionado.</p>']},
  {id:'b10', cat:'recomendaciones', title:'5 utensilios que sí vale la pena comprar', date:'15 oct 2026', read:'5 min', art:{type:'cupcake', c:['#f6dca0','#c9b8e8','#e0708f','#ffc2cf']}, bg:'#ece4f8',
   excerpt:'Balanza, espátula angular, termómetro y más.',
   body:['<ol><li>Balanza digital de cocina</li><li>Espátula angular</li><li>Termómetro para horno</li><li>Mangas y boquillas básicas</li><li>Giratoria para tortas</li></ol>']},
  {id:'b11', cat:'entrevistas', title:'Conversamos con Doña Rosa, 40 años de repostería', date:'10 oct 2026', read:'7 min', art:{type:'tart', c:['#e8b96b','#fff3d6','#e0455f','#7a4fb3']}, bg:'#fdefd9',
   excerpt:'«El secreto es el cariño y la mantequilla buena», nos cuenta.',
   body:['<p>Doña Rosa empezó vendiendo pasteles en su barrio de Guayaquil. Hoy capacita a jóvenes pasteleros. Nos habló de tradición, de las recetas de la abuela y de cómo la repostería sigue uniendo familias.</p>']},
  {id:'b12', cat:'negocio', title:'¡Abrimos sucursal en Samborondón!', date:'9 nov 2026', read:'2 min', isNew:true, art:{type:'layer', c:['#f6dca0','#ffffff','#e0708f','#ffd9e0']}, bg:'#e3eef9',
   excerpt:'Plaza Lagos, local 14. Con inauguración y porciones de regalo.',
   body:['<p>Desde el 15 de noviembre nos encuentras también en Samborondón. El día de apertura, la primera porción va por nuestra cuenta.</p>']}
];

/* ---- Textos legales ---- */
DE.faq = [
  ['¿Con cuánta anticipación debo pedir una torta personalizada?','Con al menos 48 horas. En fechas especiales (Navidad, Día de la Madre) recomendamos 7 días.'],
  ['¿Hacen entregas a domicilio?','Sí, en Guayaquil y Samborondón. El costo depende de la zona y es gratis desde $40.'],
  ['¿Qué métodos de pago aceptan?','Pago con tarjeta de crédito o débito en línea. También aceptamos efectivo en el local.'],
  ['¿Puedo cambiar mi pedido?','Hasta 24 horas antes de la entrega, escribiéndonos por WhatsApp o desde el chat.'],
  ['¿Cómo sé el estado de mi pedido?','En «Mi cuenta → Mis pedidos» o con tu número de pedido en la sección Pedidos. También te avisamos por correo o WhatsApp.'],
  ['¿Tienen opciones sin gluten o sin lactosa?','Sí, los macarons y brownies son sin gluten. Consúltanos para adaptar tu torta.']
];
DE.legal = {
  terminos:{t:'Términos y condiciones', h:'<p>Al usar este sitio aceptas estas condiciones. Los pedidos se confirman una vez recibido el pago. Las tortas personalizadas requieren 48 horas de anticipación.</p><h4>Cambios y cancelaciones</h4><p>Puedes modificar o cancelar hasta 24 horas antes de la entrega. Pasado ese plazo no se realizan reembolsos por ser productos elaborados a medida.</p><h4>Entregas</h4><p>Los horarios son estimados y pueden variar por tráfico o clima. Debes revisar el producto al recibirlo.</p><p class="muted">Texto de ejemplo para el prototipo.</p>'},
  datos:{t:'Protección de datos personales', h:'<p>Dulce Encanto trata tus datos conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador.</p><h4>¿Qué datos recopilamos?</h4><ul><li>Nombre, correo y teléfono para gestionar tus pedidos.</li><li>Dirección, solo si eliges delivery.</li><li>Datos de pago: se procesan por una pasarela segura; nosotros no almacenamos tu tarjeta.</li></ul><h4>Tus derechos</h4><p>Puedes acceder, rectificar, eliminar tus datos o retirar tu consentimiento desde «Mi cuenta → Mis datos».</p><p class="muted">Texto de ejemplo para el prototipo.</p>'}
};
