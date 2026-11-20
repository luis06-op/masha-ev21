-- ============================================================================
--  EVIDENCIA 21 · "Masha y el Oso" — Datos iniciales
--  Se puede ejecutar varias veces: usa ON CONFLICT para no duplicar filas.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Personajes
-- ----------------------------------------------------------------------------
INSERT INTO personajes
  (slug, nombre, emoji, rol, descripcion, descripcion_larga, rasgos,
   primera_aparicion, frase, imagen, color, orden)
VALUES
  ('masha', 'Masha', '👧', 'Protagonista',
   'Curiosa, inquieta y con una energía que no se acaba nunca. Cada día encuentra una aventura nueva en el bosque.',
   'Masha es una niña de unos cuatro años que vive cerca del bosque. Su curiosidad la mete en toda clase de líos, pero también la convierte en la mejor amiga del Oso. No le teme a nada: canta, cocina, inventa juegos y siempre encuentra la forma de arreglar lo que rompe.',
   ARRAY['Curiosa', 'Valiente', 'Traviesa', 'Cariñosa'],
   'Temporada 1, episodio 1', '«¡Oso, mira lo que encontré!»',
   'assets/img/personajes/masha.webp', '#d81b60', 1),

  ('el-oso', 'El Oso', '🐻', 'Protagonista',
   'Un exartista de circo que cambió los reflectores por la tranquilidad del bosque. Paciente, cocinero y un poco gruñón.',
   'El Oso (Mishka) disfruta de una vida tranquila en su cabaña hasta que Masha aparece en su vida. Tiene paciencia infinita, cocina de maravilla y esconde un pasado de artista de circo que sale a relucir cuando menos se espera. Aunque refunfuña, nunca deja sola a su pequeña amiga.',
   ARRAY['Paciente', 'Protector', 'Hogareño', 'Generoso'],
   'Temporada 1, episodio 1', 'Habla poco: todo lo dice con gestos.',
   'assets/img/personajes/el-oso.webp', '#8d5524', 2),

  ('las-liebres', 'Las Liebres', '🐰', 'Amigos del bosque',
   'Tres liebres veloces y juguetonas que siempre aparecen cuando hay una carrera o una travesura pendiente.',
   'Las liebres son las vecinas más rápidas del bosque. Compiten con Masha, le roban los bocadillos al Oso y desaparecen entre los arbustos antes de que alguien pueda regañarlas. Aun así, son las primeras en aparecer cuando hay que ayudar.',
   ARRAY['Rápidas', 'Juguetonas', 'Competitivas'],
   'Temporada 1, episodio 2', '«¡A que no nos alcanzas!»',
   'assets/img/personajes/las-liebres.webp', '#43a047', 3),

  ('el-erizo', 'El Erizo', '🦔', 'Amigos del bosque',
   'Pequeño, espinoso y de pocas palabras. Observa todo desde un rincón y aparece justo cuando más se le necesita.',
   'El erizo casi nunca habla, pero está siempre al tanto de lo que pasa en el bosque. Le encantan las setas, la calma y esconderse entre las hojas. Cuando Masha se mete en problemas, su olfato y su paciencia resultan sorprendentemente útiles.',
   ARRAY['Tímido', 'Observador', 'Leal'],
   'Temporada 1, episodio 4', 'Prefiere escuchar antes que hablar.',
   'assets/img/personajes/el-erizo.webp', '#6d4c41', 4),

  ('la-ardilla', 'La Ardilla', '🐿️', 'Amiga traviesa',
   'Veloz, glotona y experta en esconder cosas. Adora las golosinas de Masha y desaparece en un abrir y cerrar de ojos.',
   'La ardilla vive en los árboles que rodean la cabaña del Oso. Su mayor talento es desaparecer con cualquier cosa comestible y su mayor debilidad, las golosinas de Masha. A cambio de un dulce, es capaz de subir a la copa más alta del bosque.',
   ARRAY['Golosa', 'Veloz', 'Astuta'],
   'Temporada 1, episodio 9', '«¡Eso es mío!»',
   'assets/img/personajes/la-ardilla.webp', '#ef6c00', 5)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Episodios
-- ----------------------------------------------------------------------------
INSERT INTO episodios
  (temporada, numero, titulo, titulo_original, sinopsis, duracion,
   popularidad, imagen, destacado, orden)
VALUES
  (1, 1, 'Primera reunión', 'First Meeting',
   'Masha escapa de casa y termina en la cabaña del Oso. Lo que empieza como una invasión termina siendo el inicio de una amistad inolvidable.',
   '6 min 50 s', 97, 'assets/img/episodios/ep-01.webp', true, 1),

  (1, 7, 'Receta para el desastre', 'Recipe for Disaster',
   'Masha juega a ser doctora y trata a todos los animales del bosque. El Oso, convertido en paciente, descubre que curarse puede ser divertidísimo.',
   '7 min', 99, 'assets/img/episodios/ep-02.webp', true, 2),

  (2, 4, 'Tres nórdicas', 'Three Nordics',
   'Tres pingüinos llegan al bosque en pleno invierno. Masha organiza trineos, patinaje y hasta un iglú para que se sientan como en casa.',
   '7 min', 93, 'assets/img/episodios/ep-03.webp', false, 3),

  (1, 11, '¡Llámame, por favor!', 'Call Me Please!',
   'Masha consigue un teléfono y llama a todo el mundo... menos cuando de verdad hace falta. El Oso tendrá que enseñarle a usarlo.',
   '6 min 50 s', 89, 'assets/img/episodios/ep-04.webp', false, 4),

  (1, 12, 'Vacaciones en el hielo', 'Holiday on Ice',
   'El invierno convierte el bosque en una pista de hielo. Patines, caídas y una competencia de figuras que nadie va a olvidar.',
   '7 min 10 s', 91, 'assets/img/episodios/ep-05.webp', false, 5),

  (1, 15, 'El primo pequeño', 'Little Cousin',
   'El Oso recibe la visita de su primo pequeño. Masha quiere jugar con él, pero cuidar a un osezno es más difícil de lo que parece.',
   '7 min', 86, 'assets/img/episodios/ep-06.webp', false, 6),

  (1, 20, 'De pesca', 'Gone Fishing',
   'Una tarde de pesca se convierte en una aventura cuando Masha decide que los peces también merecen un espectáculo.',
   '7 min', 90, 'assets/img/episodios/ep-07.webp', false, 7),

  (1, 26, 'Sorpresa, sorpresa', 'Surprise! Surprise!',
   'Es el cumpleaños del Oso y Masha prepara una sorpresa. El problema: las sorpresas de Masha nunca salen como están planeadas.',
   '7 min', 84, 'assets/img/episodios/ep-08.webp', false, 8),

  (1, 33, 'Un cuadro perfecto', 'Picture Perfect',
   'Masha descubre la pintura y decide retratar a todos sus amigos. El resultado es tan caótico como colorido.',
   '7 min', 82, 'assets/img/episodios/ep-09.webp', false, 9)
ON CONFLICT (temporada, numero) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Galería (27 imágenes)
-- ----------------------------------------------------------------------------
INSERT INTO galeria (titulo, descripcion, imagen, imagen_xl, categoria, alt, orden)
VALUES
  ('¡Hola!', 'Masha saluda desde el bosque.', 'assets/img/galeria/g01.webp', 'assets/img/galeria/g01-xl.webp', 'Masha', 'Masha saluda con una mano y sonríe', 1),
  ('Brazos abiertos', 'Siempre lista para un abrazo.', 'assets/img/galeria/g02.webp', 'assets/img/galeria/g02-xl.webp', 'Masha', 'Masha con los brazos abiertos y una gran sonrisa', 2),
  ('Vestido de lunares', 'Su atuendo más famoso.', 'assets/img/galeria/g03.webp', 'assets/img/galeria/g03-xl.webp', 'Masha', 'Masha con vestido rojo de lunares y pañuelo', 3),
  ('Ropa de invierno', 'Abrigada para jugar en la nieve.', 'assets/img/galeria/g04.webp', 'assets/img/galeria/g04-xl.webp', 'Masha', 'Masha con abrigo de invierno y gorro blanco', 4),
  ('Cazamariposas', 'A la caza de una aventura.', 'assets/img/galeria/g05.webp', 'assets/img/galeria/g05-xl.webp', 'Masha', 'Masha sostiene un cazamariposas', 5),
  ('Pura alegría', 'No hay día triste con Masha.', 'assets/img/galeria/g06.webp', 'assets/img/galeria/g06-xl.webp', 'Masha', 'Masha celebra con los brazos extendidos', 6),
  ('Marco de flores', 'Un retrato de primavera.', 'assets/img/galeria/g07.webp', 'assets/img/galeria/g07-xl.webp', 'Masha', 'Masha dentro de un marco rosado con flores', 7),
  ('Exploradora', 'Lista para descubrir el bosque.', 'assets/img/galeria/g08.webp', 'assets/img/galeria/g08-xl.webp', 'Masha', 'Masha con gorra y red de exploradora', 8),
  ('Pintora', 'Su lado más artístico.', 'assets/img/galeria/g09.webp', 'assets/img/galeria/g09-xl.webp', 'Masha', 'Masha con paleta de pintura y pincel', 9),
  ('Saludo real', 'Como una pequeña celebridad.', 'assets/img/galeria/g10.webp', 'assets/img/galeria/g10-xl.webp', 'Masha', 'Masha saluda con elegancia', 10),
  ('Sentada a la orilla', 'Un momento de calma (muy raro).', 'assets/img/galeria/g11.webp', 'assets/img/galeria/g11-xl.webp', 'Masha', 'Masha sentada y sonriendo', 11),
  ('El Oso saluda', 'El anfitrión del bosque.', 'assets/img/galeria/g12.webp', 'assets/img/galeria/g12-xl.webp', 'El Oso', 'El Oso saluda con una pata levantada', 12),
  ('Paseo tranquilo', 'Rumbo a su cabaña.', 'assets/img/galeria/g13.webp', 'assets/img/galeria/g13-xl.webp', 'El Oso', 'El Oso camina por el bosque', 13),
  ('El guardián', 'Nadie cuida el bosque como él.', 'assets/img/galeria/g14.webp', 'assets/img/galeria/g14-xl.webp', 'El Oso', 'El Oso de pie, mirando al frente', 14),
  ('Manos arriba', 'Rendido ante las travesuras de Masha.', 'assets/img/galeria/g15.webp', 'assets/img/galeria/g15-xl.webp', 'El Oso', 'El Oso levanta las patas sorprendido', 15),
  ('Baile del Oso', 'Su pasado de circo sale a relucir.', 'assets/img/galeria/g16.webp', 'assets/img/galeria/g16-xl.webp', 'El Oso', 'El Oso baila con una pata en el aire', 16),
  ('Primer plano', 'Paciencia de oso.', 'assets/img/galeria/g17.webp', 'assets/img/galeria/g17-xl.webp', 'El Oso', 'Primer plano de la cara del Oso con Masha en su cabeza', 17),
  ('Hombros de confianza', 'El mejor mirador del bosque.', 'assets/img/galeria/g18.webp', 'assets/img/galeria/g18-xl.webp', 'Juntos', 'Masha sentada en los hombros del Oso', 18),
  ('Dos amigos', 'El inicio de todo.', 'assets/img/galeria/g19.webp', 'assets/img/galeria/g19-xl.webp', 'Juntos', 'Masha y el Oso juntos', 19),
  ('Abrazo de oso', 'Un abrazo que lo arregla todo.', 'assets/img/galeria/g20.webp', 'assets/img/galeria/g20-xl.webp', 'Juntos', 'El Oso abraza a Masha', 20),
  ('Descanso en el prado', 'Después de tanto jugar.', 'assets/img/galeria/g21.webp', 'assets/img/galeria/g21-xl.webp', 'Juntos', 'Masha sentada sobre el Oso recostado', 21),
  ('¡Más alto!', 'Masha siempre quiere ver más lejos.', 'assets/img/galeria/g22.webp', 'assets/img/galeria/g22-xl.webp', 'Juntos', 'El Oso alza a Masha con una pata', 22),
  ('La dupla del bosque', 'Juntos hasta el final.', 'assets/img/galeria/g23.webp', 'assets/img/galeria/g23-xl.webp', 'Juntos', 'El Oso con Masha sobre sus hombros', 23),
  ('Los conejos', 'Compañeros de carreras.', 'assets/img/galeria/g24.webp', 'assets/img/galeria/g24-xl.webp', 'Amigos', 'Masha rodeada de liebres', 24),
  ('El erizo', 'Pequeño pero importante.', 'assets/img/galeria/g25.webp', 'assets/img/galeria/g25-xl.webp', 'Amigos', 'Un erizo mira de frente', 25),
  ('Con la liebre', 'Un pincel y una amistad.', 'assets/img/galeria/g26.webp', 'assets/img/galeria/g26-xl.webp', 'Amigos', 'Masha sostiene un pincel junto a una liebre', 26),
  ('La ardilla', 'Siempre al acecho de una golosina.', 'assets/img/galeria/g27.webp', 'assets/img/galeria/g27-xl.webp', 'Amigos', 'Masha con una golosina y una ardilla', 27)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Valoraciones de ejemplo (3 por episodio) para que la interfaz no arranque vacía
-- ----------------------------------------------------------------------------
INSERT INTO valoraciones (episodio_id, puntuacion, ip_hash) VALUES
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 1), 5, 'demo-01'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 1), 5, 'demo-02'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 1), 4, 'demo-03'),

  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 7), 5, 'demo-04'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 7), 5, 'demo-05'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 7), 5, 'demo-06'),

  ((SELECT id FROM episodios WHERE temporada = 2 AND numero = 4), 5, 'demo-07'),
  ((SELECT id FROM episodios WHERE temporada = 2 AND numero = 4), 5, 'demo-08'),
  ((SELECT id FROM episodios WHERE temporada = 2 AND numero = 4), 4, 'demo-09'),

  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 11), 5, 'demo-10'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 11), 4, 'demo-11'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 11), 4, 'demo-12'),

  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 12), 5, 'demo-13'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 12), 5, 'demo-14'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 12), 4, 'demo-15'),

  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 15), 4, 'demo-16'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 15), 4, 'demo-17'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 15), 5, 'demo-18'),

  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 20), 5, 'demo-19'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 20), 4, 'demo-20'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 20), 4, 'demo-21'),

  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 26), 4, 'demo-22'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 26), 4, 'demo-23'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 26), 5, 'demo-24'),

  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 33), 4, 'demo-25'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 33), 4, 'demo-26'),
  ((SELECT id FROM episodios WHERE temporada = 1 AND numero = 33), 4, 'demo-27')
ON CONFLICT (episodio_id, ip_hash) DO NOTHING;
