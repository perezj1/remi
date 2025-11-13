// Traducciones de tareas por ID
export interface TaskTranslation {
  title: string;
  description: string;
}

export const TASK_TRANSLATIONS: Record<string, Record<string, TaskTranslation>> = {
  // Bajar peso
  "c911ced7-5abb-4d31-8ee8-7c5738875989": {
    es: { title: "Camina 15 minutos", description: "Da un paseo corto después de comer para activar tu metabolismo" },
    en: { title: "Walk 15 minutes", description: "Take a short walk after eating to activate your metabolism" },
    de: { title: "15 Minuten gehen", description: "Machen Sie nach dem Essen einen kurzen Spaziergang, um Ihren Stoffwechsel zu aktivieren" }
  },
  "3fb61f5a-db02-4611-8e58-31134075abc9": {
    es: { title: "Bebe agua antes de comer", description: "Toma un vaso de agua 20 minutos antes de cada comida" },
    en: { title: "Drink water before eating", description: "Drink a glass of water 20 minutes before each meal" },
    de: { title: "Trinken Sie Wasser vor dem Essen", description: "Trinken Sie 20 Minuten vor jeder Mahlzeit ein Glas Wasser" }
  },
  "94318711-1403-49e1-9565-8afbb9db6e0d": {
    es: { title: "Usa escaleras", description: "Sube escaleras en lugar del ascensor hoy" },
    en: { title: "Use stairs", description: "Take the stairs instead of the elevator today" },
    de: { title: "Benutze die Treppe", description: "Nehmen Sie heute die Treppe statt den Aufzug" }
  },
  "a49985bd-8213-4cf5-8585-75bc5a0e7afa": {
    es: { title: "Porciones más pequeñas", description: "Usa un plato más pequeño en tu próxima comida" },
    en: { title: "Smaller portions", description: "Use a smaller plate for your next meal" },
    de: { title: "Kleinere Portionen", description: "Verwenden Sie einen kleineren Teller für Ihre nächste Mahlzeit" }
  },
  "e515b06d-5262-4bbe-97f9-dae1f2e39fc3": {
    es: { title: "Mastica despacio", description: "Tómate al menos 20 minutos para comer tu próxima comida" },
    en: { title: "Chew slowly", description: "Take at least 20 minutes to eat your next meal" },
    de: { title: "Langsam kauen", description: "Nehmen Sie sich mindestens 20 Minuten Zeit für Ihre nächste Mahlzeit" }
  },

  // Ahorrar
  "89b20ce0-1e30-4d99-b3c0-26010408941f": {
    es: { title: "Regla 24 horas", description: "Espera 24 horas antes de hacer una compra impulsiva" },
    en: { title: "24-hour rule", description: "Wait 24 hours before making an impulse purchase" },
    de: { title: "24-Stunden-Regel", description: "Warten Sie 24 Stunden, bevor Sie einen Impulskauf tätigen" }
  },
  "a29aa29b-132e-4566-b9cb-67e36ff23436": {
    es: { title: "Café en casa", description: "Prepara tu café en casa en lugar de comprarlo" },
    en: { title: "Coffee at home", description: "Make your coffee at home instead of buying it" },
    de: { title: "Kaffee zu Hause", description: "Machen Sie Ihren Kaffee zu Hause, anstatt ihn zu kaufen" }
  },
  "d03ff73b-e599-409d-918f-573360eea66f": {
    es: { title: "Lista de compras", description: "Haz una lista antes de ir al supermercado y síguela" },
    en: { title: "Shopping list", description: "Make a list before going to the supermarket and follow it" },
    de: { title: "Einkaufsliste", description: "Erstellen Sie eine Liste, bevor Sie zum Supermarkt gehen, und befolgen Sie sie" }
  },
  "1a784256-3711-40e9-be83-a398b2929a1f": {
    es: { title: "Revisa suscripciones", description: "Revisa tus suscripciones y cancela las que no uses" },
    en: { title: "Review subscriptions", description: "Review your subscriptions and cancel the ones you don't use" },
    de: { title: "Abonnements überprüfen", description: "Überprüfen Sie Ihre Abonnements und kündigen Sie die, die Sie nicht nutzen" }
  },
  "7e7b869c-d311-485d-b4f1-cdaf1f5bf807": {
    es: { title: "Comida casera", description: "Cocina en casa en lugar de pedir comida" },
    en: { title: "Home-cooked meal", description: "Cook at home instead of ordering food" },
    de: { title: "Hausgemachtes Essen", description: "Kochen Sie zu Hause, anstatt Essen zu bestellen" }
  },

  // Mantenerse en forma
  "6eeae41b-8b89-4d4d-bb33-e2c8245e2108": {
    es: { title: "10 flexiones", description: "Haz 10 flexiones ahora mismo" },
    en: { title: "10 push-ups", description: "Do 10 push-ups right now" },
    de: { title: "10 Liegestütze", description: "Machen Sie jetzt 10 Liegestütze" }
  },
  "2eecd1b6-d1f0-4207-8db7-47598b08508c": {
    es: { title: "Estira 5 minutos", description: "Toma 5 minutos para estirar todo tu cuerpo" },
    en: { title: "Stretch 5 minutes", description: "Take 5 minutes to stretch your whole body" },
    de: { title: "5 Minuten dehnen", description: "Nehmen Sie sich 5 Minuten Zeit, um Ihren ganzen Körper zu dehnen" }
  },
  "09ec9bfc-0d8c-4eed-b14e-e76e9ff90e24": {
    es: { title: "20 sentadillas", description: "Realiza 20 sentadillas con buena forma" },
    en: { title: "20 squats", description: "Perform 20 squats with good form" },
    de: { title: "20 Kniebeugen", description: "Führen Sie 20 Kniebeugen mit guter Form aus" }
  },
  "d7f57a6b-68f2-47d1-ad7a-6e48f38f1b1a": {
    es: { title: "Plank 30 segundos", description: "Mantén la posición de plancha durante 30 segundos" },
    en: { title: "Plank 30 seconds", description: "Hold a plank position for 30 seconds" },
    de: { title: "Plank 30 Sekunden", description: "Halten Sie eine Plank-Position für 30 Sekunden" }
  },
  "b29ef8c1-5426-4f47-b91e-2e9c0a8d7e3b": {
    es: { title: "Salta la cuerda", description: "Salta la cuerda durante 3 minutos" },
    en: { title: "Jump rope", description: "Jump rope for 3 minutes" },
    de: { title: "Seilspringen", description: "Springen Sie 3 Minuten Seil" }
  },

  // Dejar de fumar
  "a17a32a2-6eca-4fec-9b38-519fedd5b3de": {
    es: { title: "Respira profundo", description: "Cuando sientas el deseo, respira profundamente 10 veces" },
    en: { title: "Breathe deeply", description: "When you feel the urge, breathe deeply 10 times" },
    de: { title: "Tief atmen", description: "Wenn Sie das Verlangen spüren, atmen Sie 10 Mal tief ein" }
  },
  "c2dc75d6-e918-440d-bb18-ff31f04c7737": {
    es: { title: "Bebe agua", description: "Mantén una botella de agua cerca y bebe cuando tengas ganas" },
    en: { title: "Drink water", description: "Keep a water bottle nearby and drink when you feel the urge" },
    de: { title: "Wasser trinken", description: "Halten Sie eine Wasserflasche bereit und trinken Sie, wenn Sie das Verlangen spüren" }
  },
  "7d01f5cb-9f2e-4bc8-b093-237764296b3f": {
    es: { title: "Mastica chicle", description: "Ten chicle sin azúcar a mano para ocupar tu boca" },
    en: { title: "Chew gum", description: "Keep sugar-free gum handy to keep your mouth busy" },
    de: { title: "Kaugummi kauen", description: "Halten Sie zuckerfreien Kaugummi bereit, um Ihren Mund zu beschäftigen" }
  },
  "ebf7838f-6ee8-4eca-ae1a-feb0bf421126": {
    es: { title: "Llama a alguien", description: "Habla con un amigo durante 5 minutos cuando sientas el impulso" },
    en: { title: "Call someone", description: "Talk to a friend for 5 minutes when you feel the urge" },
    de: { title: "Rufen Sie jemanden an", description: "Sprechen Sie 5 Minuten mit einem Freund, wenn Sie das Verlangen spüren" }
  },
  "b540727c-4b25-45fb-aa16-21fe6e916a48": {
    es: { title: "Camina 5 minutos", description: "Sal a caminar cuando aparezca el deseo de fumar" },
    en: { title: "Walk 5 minutes", description: "Go for a walk when the urge to smoke appears" },
    de: { title: "5 Minuten gehen", description: "Gehen Sie spazieren, wenn das Verlangen zu rauchen auftritt" }
  },

  // Comer más sano
  "99d4cf91-942c-42ca-a493-568851436f40": {
    es: { title: "Añade una fruta", description: "Incluye una fruta en tu próxima comida o snack" },
    en: { title: "Add a fruit", description: "Include a fruit in your next meal or snack" },
    de: { title: "Fügen Sie Obst hinzu", description: "Fügen Sie eine Frucht zu Ihrer nächsten Mahlzeit oder Snack hinzu" }
  },
  "07cb09da-d1a7-48ea-8e3a-011944da0ab3": {
    es: { title: "Proteína en el desayuno", description: "Incluye proteína en tu desayuno de mañana" },
    en: { title: "Protein at breakfast", description: "Include protein in tomorrow's breakfast" },
    de: { title: "Protein zum Frühstück", description: "Fügen Sie Protein zu Ihrem morgigen Frühstück hinzu" }
  },
  "4fd33685-4585-4881-b8be-3ff3ac7c938b": {
    es: { title: "Evita procesados", description: "Elige alimentos sin procesar en tu próxima comida" },
    en: { title: "Avoid processed foods", description: "Choose unprocessed foods in your next meal" },
    de: { title: "Vermeiden Sie verarbeitete Lebensmittel", description: "Wählen Sie unverarbeitete Lebensmittel für Ihre nächste Mahlzeit" }
  },
  "dbf7a39c-9430-475a-9ad9-3aad03d90e4e": {
    es: { title: "Snack de vegetales", description: "Prepara palitos de zanahoria o apio como snack" },
    en: { title: "Vegetable snack", description: "Prepare carrot or celery sticks as a snack" },
    de: { title: "Gemüse-Snack", description: "Bereiten Sie Karotten- oder Selleriesticks als Snack vor" }
  },
  "38d688ce-9b7c-45e0-906d-a00bb69a7048": {
    es: { title: "Ensalada de entrada", description: "Empieza tu comida con una ensalada pequeña" },
    en: { title: "Salad starter", description: "Start your meal with a small salad" },
    de: { title: "Salat als Vorspeise", description: "Beginnen Sie Ihre Mahlzeit mit einem kleinen Salat" }
  },

  // Dormir mejor
  "546c2025-f05a-41f3-b23a-c9eee5c621bc": {
    es: { title: "Rutina de sueño", description: "Ve a la cama a la misma hora esta noche" },
    en: { title: "Sleep routine", description: "Go to bed at the same time tonight" },
    de: { title: "Schlafroutine", description: "Gehen Sie heute Abend zur gleichen Zeit ins Bett" }
  },
  "4732bc2c-28c4-42fc-8df0-414bcf50d126": {
    es: { title: "Sin pantallas 1 hora antes", description: "Apaga todos los dispositivos 1 hora antes de dormir" },
    en: { title: "No screens 1 hour before", description: "Turn off all devices 1 hour before sleep" },
    de: { title: "Keine Bildschirme 1 Stunde vorher", description: "Schalten Sie alle Geräte 1 Stunde vor dem Schlafengehen aus" }
  },
  "f8441ac3-38f4-4d2a-a628-f470b8a8d819": {
    es: { title: "Té relajante", description: "Prepara una infusión relajante antes de dormir" },
    en: { title: "Relaxing tea", description: "Prepare a relaxing tea before sleep" },
    de: { title: "Entspannender Tee", description: "Bereiten Sie einen entspannenden Tee vor dem Schlafengehen vor" }
  },
  "cd9b2ab8-e13f-492e-8ef9-5f54a7b727c0": {
    es: { title: "Oscurece tu habitación", description: "Asegúrate de que tu cuarto esté completamente oscuro" },
    en: { title: "Darken your room", description: "Make sure your room is completely dark" },
    de: { title: "Verdunkeln Sie Ihr Zimmer", description: "Stellen Sie sicher, dass Ihr Zimmer vollständig dunkel ist" }
  },
  "f5d50683-7d44-4e9e-922e-3a76b026a45e": {
    es: { title: "Temperatura fresca", description: "Mantén tu habitación fresca (18-20°C)" },
    en: { title: "Cool temperature", description: "Keep your room cool (18-20°C)" },
    de: { title: "Kühle Temperatur", description: "Halten Sie Ihr Zimmer kühl (18-20°C)" }
  },

  // Eliminar estrés
  "eab559a6-77df-40da-b877-efe06e642816": {
    es: { title: "Desconecta 15 minutos", description: "Apaga el teléfono y descansa 15 minutos" },
    en: { title: "Disconnect 15 minutes", description: "Turn off your phone and rest for 15 minutes" },
    de: { title: "15 Minuten abschalten", description: "Schalten Sie Ihr Telefon aus und ruhen Sie sich 15 Minuten aus" }
  },
  "f5f8d115-d2d6-47eb-9fe1-f4ff434099de": {
    es: { title: "Meditación 5 minutos", description: "Practica 5 minutos de meditación guiada" },
    en: { title: "5-minute meditation", description: "Practice 5 minutes of guided meditation" },
    de: { title: "5 Minuten Meditation", description: "Üben Sie 5 Minuten geführte Meditation" }
  },
  "25b1c526-7405-4e94-b883-c4898477fddb": {
    es: { title: "Escribe 3 cosas positivas", description: "Anota 3 cosas buenas que te pasaron hoy" },
    en: { title: "Write 3 positive things", description: "Write down 3 good things that happened today" },
    de: { title: "Schreiben Sie 3 positive Dinge", description: "Schreiben Sie 3 gute Dinge auf, die heute passiert sind" }
  },
  "b7585f73-6441-4bec-b3e1-863436296842": {
    es: { title: "Respira 4-7-8", description: "Practica la técnica 4-7-8: inhala 4, retén 7, exhala 8" },
    en: { title: "Breathe 4-7-8", description: "Practice the 4-7-8 technique: inhale 4, hold 7, exhale 8" },
    de: { title: "Atmen Sie 4-7-8", description: "Üben Sie die 4-7-8-Technik: einatmen 4, halten 7, ausatmen 8" }
  },
  "17a3cf51-a551-4dee-adc8-beb800f5dabd": {
    es: { title: "Música relajante", description: "Escucha música tranquila durante 10 minutos" },
    en: { title: "Relaxing music", description: "Listen to calm music for 10 minutes" },
    de: { title: "Entspannende Musik", description: "Hören Sie 10 Minuten lang ruhige Musik" }
  },

  // Mejorar el medio ambiente
  "a5e3f0b1-2c4d-4e5f-a6b7-8c9d0e1f2a3b": {
    es: { title: "Lleva tu bolsa", description: "Usa tu propia bolsa reutilizable para las compras" },
    en: { title: "Bring your bag", description: "Use your own reusable bag for shopping" },
    de: { title: "Bringen Sie Ihre Tasche mit", description: "Verwenden Sie Ihre eigene wiederverwendbare Tasche zum Einkaufen" }
  },
  "b6f4a1c2-3d5e-4f6a-b7c8-9d0e1f2a3b4c": {
    es: { title: "Desconecta aparatos", description: "Desconecta los aparatos que no estés usando" },
    en: { title: "Unplug devices", description: "Unplug devices you're not using" },
    de: { title: "Geräte ausstecken", description: "Trennen Sie Geräte, die Sie nicht verwenden" }
  },
  "c7a5b2d3-4e6f-5a7b-c8d9-0e1f2a3b4c5d": {
    es: { title: "Ducha corta", description: "Reduce tu ducha en 2 minutos hoy" },
    en: { title: "Short shower", description: "Reduce your shower by 2 minutes today" },
    de: { title: "Kurze Dusche", description: "Verkürzen Sie Ihre Dusche heute um 2 Minuten" }
  },
  "d8b6c3e4-5f7a-6b8c-d9e0-1f2a3b4c5d6e": {
    es: { title: "Recicla correctamente", description: "Separa tu basura en reciclaje, orgánico y general" },
    en: { title: "Recycle properly", description: "Separate your waste into recycling, organic and general" },
    de: { title: "Richtig recyceln", description: "Trennen Sie Ihren Müll in Recycling, organisch und allgemein" }
  },
  "e9c7d4f5-6a8b-7c9d-e0f1-2a3b4c5d6e7f": {
    es: { title: "Transporte sostenible", description: "Usa bicicleta, camina o transporte público hoy" },
    en: { title: "Sustainable transport", description: "Use bike, walk or public transport today" },
    de: { title: "Nachhaltiger Transport", description: "Nutzen Sie heute Fahrrad, gehen Sie zu Fuss oder nutzen Sie öffentliche Verkehrsmittel" }
  },

  // Reducir uso de pantallas
  "f0d8e5a6-7b9c-8d0e-f1a2-3b4c5d6e7f8a": {
    es: { title: "Sin teléfono en comidas", description: "Guarda el teléfono durante las comidas" },
    en: { title: "No phone during meals", description: "Put away your phone during meals" },
    de: { title: "Kein Telefon beim Essen", description: "Legen Sie Ihr Telefon während der Mahlzeiten weg" }
  },
  "a1e9f6b7-8c0d-9e1f-a2b3-4c5d6e7f8a9b": {
    es: { title: "Lee 15 minutos", description: "Lee un libro físico durante 15 minutos" },
    en: { title: "Read 15 minutes", description: "Read a physical book for 15 minutes" },
    de: { title: "15 Minuten lesen", description: "Lesen Sie 15 Minuten lang ein physisches Buch" }
  },
  "b2f0a7c8-9d1e-0f2a-b3c4-5d6e7f8a9b0c": {
    es: { title: "Modo avión 1 hora", description: "Activa modo avión durante 1 hora" },
    en: { title: "Airplane mode 1 hour", description: "Turn on airplane mode for 1 hour" },
    de: { title: "Flugmodus 1 Stunde", description: "Aktivieren Sie den Flugmodus für 1 Stunde" }
  },
  "c3a1b8d9-0e2f-1a3b-c4d5-6e7f8a9b0c1d": {
    es: { title: "Paseo sin móvil", description: "Sal a caminar 20 minutos sin tu teléfono" },
    en: { title: "Walk without phone", description: "Go for a 20-minute walk without your phone" },
    de: { title: "Spaziergang ohne Telefon", description: "Machen Sie einen 20-minütigen Spaziergang ohne Ihr Telefon" }
  },
  "d4b2c9e0-1f3a-2b4c-d5e6-7f8a9b0c1d2e": {
    es: { title: "Desactiva notificaciones", description: "Silencia las notificaciones de redes sociales hoy" },
    en: { title: "Disable notifications", description: "Silence social media notifications today" },
    de: { title: "Benachrichtigungen deaktivieren", description: "Stummschalten Sie heute Social-Media-Benachrichtigungen" }
  },

  // Ahorrar 
  "EASY_ahorrar_1": { 
  "es": { "title": "Haz un presupuesto mensual", "description": "Haz un presupuesto rápido: ingresos y 5–10 gastos fijos/variables en una nota o app." }, 
  "en": { "title": "Make a monthly budget", "description": "Draft a quick budget: income and 5–10 fixed/variable expenses in a note or app." }, 
  "de": { "title": "Erstelle ein Monatsbudget", "description": "Schnelles Budget: Einnahmen und 5–10 fixe/variable Ausgaben in Notiz oder App festhalten." } 
},
"EASY_ahorrar_2": { 
  "es": { "title": "Cocina en casa hoy", "description": "Prepara una comida sencilla (omelette, pasta, ensalada) en vez de pedir delivery." }, 
  "en": { "title": "Cook at home today", "description": "Make a simple meal (omelet, pasta, salad) instead of ordering delivery." }, 
  "de": { "title": "Koche heute zu Hause", "description": "Bereite eine einfache Mahlzeit (Omelett, Pasta, Salat) statt zu bestellen." } 
},
"MEDIUM_ahorrar_3": { 
  "es": { "title": "Cancela una suscripción que no uses", "description": "Revisa tus suscripciones y cancela al menos una que no utilices." }, 
  "en": { "title": "Cancel a subscription you don’t use", "description": "Review your subscriptions and cancel at least one you don’t use." }, 
  "de": { "title": "Kündige ein ungenutztes Abo", "description": "Prüfe deine Abos und kündige mindestens eines, das du nicht nutzt." } 
},
"MEDIUM_ahorrar_4": { 
  "es": { "title": "Compara precios antes de comprar", "description": "Compara online en 3 webs/apps y guarda el mejor precio." }, 
  "en": { "title": "Compare prices before buying", "description": "Check 3 sites/apps online and save the best price." }, 
  "de": { "title": "Preise vor dem Kauf vergleichen", "description": "Vergleiche online in 3 Websites/Apps und speichere den besten Preis." } 
},
"EASY_ahorrar_5": { 
  "es": { "title": "Lleva tu propia botella de agua", "description": "Llena una botella reutilizable para evitar comprar bebidas fuera." }, 
  "en": { "title": "Bring your own water bottle", "description": "Fill a reusable bottle to avoid buying drinks outside." }, 
  "de": { "title": "Eigene Wasserflasche mitnehmen", "description": "Fülle eine wiederverwendbare Flasche, um unterwegs nichts zu kaufen." } 
},
"HARD_ahorrar_6": { 
  "es": { "title": "Usa transporte público hoy", "description": "Si sales, prioriza transporte público o combina recados." }, 
  "en": { "title": "Use public transport today", "description": "If you go out, prioritize public transport or combine errands." }, 
  "de": { "title": "Heute mit ÖV fahren", "description": "Wenn du rausgehst, nutze ÖV oder kombiniere Wege." } 
},
"EASY_ahorrar_7": { 
  "es": { "title": "Haz una lista antes del súper", "description": "Crea una lista en casa y cíñete a ella para evitar impulsos." }, 
  "en": { "title": "Make a list before the grocery store", "description": "Write a list at home and stick to it to avoid impulse buys." }, 
  "de": { "title": "Einkaufsliste vor dem Supermarkt", "description": "Erstelle zu Hause eine Liste und halte dich daran, um Impulskäufe zu vermeiden." } 
},
"HARD_ahorrar_8": { 
  "es": { "title": "Repara algo en vez de comprar nuevo", "description": "Dedica 20–30 min a arreglar o mantener un objeto." }, 
  "en": { "title": "Repair something instead of buying new", "description": "Spend 20–30 min fixing or maintaining an item." }, 
  "de": { "title": "Etwas reparieren statt neu kaufen", "description": "Nimm dir 20–30 Min., um einen Gegenstand zu reparieren oder zu pflegen." } 
},
"HARD_ahorrar_9": { 
  "es": { "title": "Ahorra el 10% de tus ingresos", "description": "Programa una transferencia automática (objetivo 10%)." }, 
  "en": { "title": "Save 10% of your income", "description": "Set up an automatic transfer (goal 10%)." }, 
  "de": { "title": "10 % des Einkommens sparen", "description": "Richte eine automatische Überweisung ein (Ziel 10 %)." } 
},
"EASY_ahorrar_10": { 
  "es": { "title": "Evita el café de cafetería", "description": "Prepara tu café en casa y calcula el ahorro." }, 
  "en": { "title": "Skip café coffee", "description": "Brew your coffee at home and estimate the savings." }, 
  "de": { "title": "Kaffee nicht im Café kaufen", "description": "Koche deinen Kaffee zu Hause und berechne die Ersparnis." } 
},
"HARD_ahorrar_11": { 
  "es": { "title": "Vende algo que no uses", "description": "Publica un artículo en una app de segunda mano (fotos y precio)." }, 
  "en": { "title": "Sell something you don’t use", "description": "List an item on a second-hand app (photos and price)." }, 
  "de": { "title": "Verkaufe etwas Unbenutztes", "description": "Stelle einen Artikel in eine Secondhand-App (Fotos und Preis)." } 
},
"EASY_ahorrar_12": { 
  "es": { "title": "Usa cupones de descuento", "description": "Antes de pagar online, busca y aplica un cupón." }, 
  "en": { "title": "Use discount coupons", "description": "Before paying online, search and apply a coupon." }, 
  "de": { "title": "Gutscheincodes nutzen", "description": "Suche vor dem Online-Bezahlen nach einem Code und wende ihn an." } 
},
"MEDIUM_ahorrar_13": { 
  "es": { "title": "Planifica tus comidas semanales", "description": "Diseña 3–5 menús sencillos y lista ingredientes." }, 
  "en": { "title": "Plan your weekly meals", "description": "Draft 3–5 simple menus and list ingredients." }, 
  "de": { "title": "Wöchentliche Mahlzeiten planen", "description": "Erstelle 3–5 einfache Menüs und schreibe die Zutaten auf." } 
},
"MEDIUM_ahorrar_14": { 
  "es": { "title": "Compra productos de segunda mano", "description": "Busca desde casa un artículo que necesites en marketplaces." }, 
  "en": { "title": "Buy second-hand items", "description": "From home, find something you need on marketplaces." }, 
  "de": { "title": "Secondhand kaufen", "description": "Suche von zu Hause aus ein benötigtes Produkt in Marktplätzen." } 
},
"EASY_ahorrar_15": { 
  "es": { "title": "Reduce el consumo de energía", "description": "Apaga regletas, luces innecesarias y activa modo ahorro." }, 
  "en": { "title": "Reduce energy use", "description": "Turn off power strips, unnecessary lights, and enable eco modes." }, 
  "de": { "title": "Energieverbrauch senken", "description": "Steckerleisten und unnötiges Licht ausschalten, Sparmodus aktivieren." } 
},
"EASY_ahorrar_16": { 
  "es": { "title": "Espera 24h antes de compras grandes", "description": "Añade al carrito y espera ≥24h antes de pagar." }, 
  "en": { "title": "Wait 24h before big purchases", "description": "Add to cart and wait ≥24h before paying." }, 
  "de": { "title": "24 Std. vor Großkäufen warten", "description": "In den Warenkorb legen und ≥24 Std. mit dem Kauf warten." } 
},
"MEDIUM_ahorrar_17": { 
  "es": { "title": "Usa apps de cashback", "description": "Instala/activa una app de cashback y vincúlala." }, 
  "en": { "title": "Use cashback apps", "description": "Install/enable a cashback app and link it." }, 
  "de": { "title": "Cashback-Apps nutzen", "description": "Installiere/aktiviere eine Cashback-App und verknüpfe sie." } 
},
"MEDIUM_ahorrar_18": { 
  "es": { "title": "Prepara tu almuerzo para mañana", "description": "Deja listo un almuerzo sencillo en la nevera." }, 
  "en": { "title": "Pack tomorrow’s lunch", "description": "Prepare a simple lunch and store it in the fridge." }, 
  "de": { "title": "Morgenessen vorbereiten", "description": "Bereite ein einfaches Lunch vor und stelle es in den Kühlschrank." } 
},
"HARD_ahorrar_19": { 
  "es": { "title": "Negocia tus facturas de servicios", "description": "Solicita una mejor tarifa por chat o teléfono." }, 
  "en": { "title": "Negotiate your utility bills", "description": "Ask for a better rate via chat or phone." }, 
  "de": { "title": "Nebenkosten verhandeln", "description": "Fordere per Chat oder Telefon einen besseren Tarif an." } 
},
"EASY_ahorrar_20": { 
  "es": { "title": "Evita compras online impulsivas", "description": "Elimina métodos de pago guardados o usa bloqueo temporal." }, 
  "en": { "title": "Avoid impulsive online buys", "description": "Remove saved payment methods or use a temporary block." }, 
  "de": { "title": "Impulskäufe online vermeiden", "description": "Gespeicherte Zahlungsmittel entfernen oder temporär sperren." } 
},
"HARD_ahorrar_21": { 
  "es": { "title": "Usa la regla de 30 días", "description": "Crea una nota “Lista de espera 30 días” para compras no esenciales." }, 
  "en": { "title": "Use the 30-day rule", "description": "Create a “30-day waitlist” note for non-essential purchases." }, 
  "de": { "title": "30-Tage-Regel anwenden", "description": "Lege eine „30-Tage-Warteliste“ für nicht notwendige Käufe an." } 
},
"MEDIUM_ahorrar_22": { 
  "es": { "title": "Organiza actividades gratuitas", "description": "Planifica hoy una actividad gratuita en casa." }, 
  "en": { "title": "Plan free activities", "description": "Plan a free at-home activity today." }, 
  "de": { "title": "Kostenlose Aktivitäten planen", "description": "Plane heute eine kostenlose Aktivität zu Hause." } 
},
"EASY_ahorrar_23": { 
  "es": { "title": "Revisa tus gastos hormiga", "description": "Detecta 1–2 pequeños gastos y define cómo recortarlos." }, 
  "en": { "title": "Audit your small “leak” expenses", "description": "Identify 1–2 small expenses and decide how to cut them." }, 
  "de": { "title": "Kleine „Leck“-Ausgaben prüfen", "description": "Finde 1–2 kleine Ausgaben und bestimme, wie du sie reduzierst." } 
},
"MEDIUM_ahorrar_24": { 
  "es": { "title": "Compra al por mayor no perecederos", "description": "Haz lista de básicos para comprar en cantidad al reponer." }, 
  "en": { "title": "Buy non-perishables in bulk", "description": "List basic items to buy in bulk when restocking." }, 
  "de": { "title": "Haltbares auf Vorrat kaufen", "description": "Liste Basisartikel, die du beim Auffüllen in Mengen kaufst." } 
},
"HARD_ahorrar_25": { 
  "es": { "title": "Usa la biblioteca pública", "description": "Saca tarjeta online o usa el catálogo digital." }, 
  "en": { "title": "Use the public library", "description": "Get a card online or use the digital catalog." }, 
  "de": { "title": "Öffentliche Bibliothek nutzen", "description": "Online Ausweis beantragen oder digitalen Katalog nutzen." } 
},
"HARD_ahorrar_26": { 
  "es": { "title": "Haz regalos caseros", "description": "Prepara un regalo DIY con materiales de casa." }, 
  "en": { "title": "Make DIY gifts", "description": "Create a homemade gift with materials you already have." }, 
  "de": { "title": "Selbstgemachte Geschenke", "description": "Bereite ein DIY-Geschenk mit vorhandenen Materialien." } 
},
"EASY_ahorrar_27": { 
  "es": { "title": "Congela alimentos a tiempo", "description": "Congela porciones y etiqueta con fecha." }, 
  "en": { "title": "Freeze food on time", "description": "Freeze portions and label them with dates." }, 
  "de": { "title": "Lebensmittel rechtzeitig einfrieren", "description": "Portionen einfrieren und mit Datum beschriften." } 
},
"HARD_ahorrar_28": { 
  "es": { "title": "Camina o usa bici para distancias cortas", "description": "Para recados cercanos, prioriza caminar o bici." }, 
  "en": { "title": "Walk or bike short distances", "description": "For nearby errands, choose walking or biking." }, 
  "de": { "title": "Kurze Strecken zu Fuß/Fahrrad", "description": "Für nahe Erledigungen zu Fuß oder mit dem Velo fahren." } 
},
"HARD_ahorrar_29": { 
  "es": { "title": "Compara seguros anualmente", "description": "Pide 2–3 cotizaciones y guarda la mejor." }, 
  "en": { "title": "Compare insurance yearly", "description": "Get 2–3 quotes and keep the best." }, 
  "de": { "title": "Versicherungen jährlich vergleichen", "description": "Hole 2–3 Offerten ein und speichere die beste." } 
},
"MEDIUM_ahorrar_30": { 
  "es": { "title": "Establece metas de ahorro específicas", "description": "Define monto/fecha y activa una regla de ahorro automático." }, 
  "en": { "title": "Set specific savings goals", "description": "Define amount/date and enable an automatic savings rule." }, 
  "de": { "title": "Konkrete Sparziele festlegen", "description": "Betrag/Datum definieren und automatische Sparregel aktivieren." } 
},
 "EASY_ahorrar_31": { "es": { "title": "Día sin gastar", "description": "Pasa 24 horas sin compras no esenciales." }, "en": { "title": "No-spend day", "description": "Go 24 hours without non-essential purchases." }, "de": { "title": "Kein-Geldausgeben-Tag", "description": "24 Stunden lang keine unnötigen Ausgaben." } },
  "EASY_ahorrar_32": { "es": { "title": "Snack de casa", "description": "Lleva un snack de casa y evita comprar fuera." }, "en": { "title": "Home-made snack", "description": "Bring a snack from home and avoid buying out." }, "de": { "title": "Snack von zu Hause", "description": "Nimm einen Snack von zu Hause mit statt etwas zu kaufen." } },
  "EASY_ahorrar_33": { "es": { "title": "Termo para café o té", "description": "Llena un termo en casa para el día." }, "en": { "title": "Thermos for coffee or tea", "description": "Fill a thermos at home for the day." }, "de": { "title": "Thermoskanne für Kaffee oder Tee", "description": "Fülle eine Thermoskanne zu Hause für den Tag." } },
  "EASY_ahorrar_34": { "es": { "title": "Lava en frío", "description": "Pon la lavadora en agua fría hoy." }, "en": { "title": "Cold-wash laundry", "description": "Run your washing machine on cold today." }, "de": { "title": "Kaltwäsche", "description": "Wasche die Wäsche heute mit Kaltwasser." } },
  "EASY_ahorrar_35": { "es": { "title": "Tendedero en vez de secadora", "description": "Seca la ropa al aire." }, "en": { "title": "Air-dry clothes", "description": "Use a drying rack instead of the dryer." }, "de": { "title": "Lufttrocknen statt Trockner", "description": "Trockne Kleidung an der Luft." } },
  "EASY_ahorrar_36": { "es": { "title": "Baja 1°C la calefacción", "description": "Ajusta 1°C menos si es posible." }, "en": { "title": "Lower heating by 1°C", "description": "Turn your thermostat down by 1°C if possible." }, "de": { "title": "Heizung um 1°C senken", "description": "Stelle, wenn möglich, 1°C niedriger ein." } },
  "EASY_ahorrar_37": { "es": { "title": "Usa luz natural", "description": "Abre cortinas y apaga focos innecesarios." }, "en": { "title": "Use natural light", "description": "Open curtains and switch off unnecessary lights." }, "de": { "title": "Natürliches Licht nutzen", "description": "Vorhänge auf und überflüssiges Licht ausschalten." } },
  "EASY_ahorrar_38": { "es": { "title": "Cocina para 2 días", "description": "Duplica receta y guarda para mañana." }, "en": { "title": "Cook for two days", "description": "Double a recipe and save tomorrow’s portion." }, "de": { "title": "Für zwei Tage kochen", "description": "Koche doppelt und hebe eine Portion für morgen auf." } },
  "EASY_ahorrar_39": { "es": { "title": "Reutiliza frascos", "description": "Usa botes vacíos como recipientes." }, "en": { "title": "Reuse jars", "description": "Use empty jars as containers." }, "de": { "title": "Gläser wiederverwenden", "description": "Nutze leere Gläser als Behälter." } },
  "EASY_ahorrar_40": { "es": { "title": "Consume primero lo que vence", "description": "Revisa nevera y despensa y usa lo que caduca antes." }, "en": { "title": "Use soon-to-expire food first", "description": "Check fridge/pantry and cook what expires first." }, "de": { "title": "Zuerst ablaufende Lebensmittel nutzen", "description": "Kühlschrank/Vorrat prüfen und zuerst Verfallendes verwenden." } },
  "EASY_ahorrar_41": { "es": { "title": "Desactiva compras in-app", "description": "Protege el móvil para evitar gastos accidentales." }, "en": { "title": "Disable in-app purchases", "description": "Protect your phone to avoid accidental spend." }, "de": { "title": "In-App-Käufe deaktivieren", "description": "Schütze das Handy, um Fehlkäufe zu vermeiden." } },
  "EASY_ahorrar_42": { "es": { "title": "Envío estándar o recogida", "description": "Evita el extra por envío exprés." }, "en": { "title": "Standard shipping or pickup", "description": "Avoid paying extra for express delivery." }, "de": { "title": "Standardsendung oder Abholung", "description": "Spare die Zusatzkosten für Expressversand." } },
  "EASY_ahorrar_43": { "es": { "title": "Almuerzo con sobras", "description": "Convierte sobras en tu comida de hoy." }, "en": { "title": "Leftovers for lunch", "description": "Turn leftovers into today’s lunch." }, "de": { "title": "Reste zum Mittag", "description": "Mache aus Resten dein heutiges Mittagessen." } },
  "EASY_ahorrar_44": { "es": { "title": "Darse de baja de promos", "description": "Desuscríbete de emails que incitan a comprar." }, "en": { "title": "Unsubscribe from promos", "description": "Unsubscribe from shopping promo emails." }, "de": { "title": "Werbe-Mails abbestellen", "description": "Melde dich von kaufanreizenden Newslettern ab." } },
  "EASY_ahorrar_45": { "es": { "title": "Lista de precios clave", "description": "Anota precios de referencia de 5 básicos." }, "en": { "title": "Key price list", "description": "Write reference prices for 5 staples." }, "de": { "title": "Preisliste für Basics", "description": "Notiere Richtpreise für 5 Grundartikel." } },
  "EASY_ahorrar_46": { "es": { "title": "Agua saborizada casera", "description": "Haz agua con fruta/menta y evita refrescos." }, "en": { "title": "Homemade infused water", "description": "Make fruit/mint water and skip soda." }, "de": { "title": "Hausgemachtes Infused Water", "description": "Mache Wasser mit Früchten/Minze und spare Limonade." } },
  "EASY_ahorrar_47": { "es": { "title": "Alternativa gratuita", "description": "Usa hoy una app o servicio gratuito equivalente." }, "en": { "title": "Free alternative", "description": "Use a free app/service alternative today." }, "de": { "title": "Kostenlose Alternative", "description": "Nutze heute eine kostenlose App/Service-Alternative." } },
  "EASY_ahorrar_48": { "es": { "title": "Inventario en casa", "description": "Busca si ya tienes lo que ibas a comprar." }, "en": { "title": "Home inventory check", "description": "Check if you already have it before buying." }, "de": { "title": "Haushaltsinventur", "description": "Prüfe, ob du es schon hast, bevor du kaufst." } },
  "EASY_ahorrar_49": { "es": { "title": "Ahorro de datos", "description": "Activa el modo de ahorro de datos en el móvil." }, "en": { "title": "Data saver", "description": "Turn on data-saving mode on your phone." }, "de": { "title": "Datensparmodus", "description": "Aktiviere den Datensparmodus am Smartphone." } },
  "EASY_ahorrar_50": { "es": { "title": "Temporizador calefacción", "description": "Programa apagado en estancias vacías." }, "en": { "title": "Heating timer", "description": "Set timers to switch off in empty rooms." }, "de": { "title": "Heizungs-Timer", "description": "Stelle Timer zum Abschalten in leeren Räumen ein." } },
  "EASY_ahorrar_51": { "es": { "title": "Desconecta cargadores", "description": "Quita cargadores que no uses." }, "en": { "title": "Unplug chargers", "description": "Unplug chargers you’re not using." }, "de": { "title": "Ladegeräte ausstecken", "description": "Ziehe ungenutzte Ladegeräte aus der Steckdose." } },
  "EASY_ahorrar_52": { "es": { "title": "Almuerzo de casa", "description": "Prepara y lleva tu comida al trabajo." }, "en": { "title": "Packed lunch", "description": "Prepare and bring your lunch to work." }, "de": { "title": "Vesper von zu Hause", "description": "Bereite dein Mittagessen vor und nimm es mit." } },
  "EASY_ahorrar_53": { "es": { "title": "Camina < 1 km", "description": "Para trayectos cortos, ve caminando." }, "en": { "title": "Walk < 1 km", "description": "Walk short trips instead of paying for transport." }, "de": { "title": "Unter 1 km zu Fuß", "description": "Kurze Strecken zu Fuß statt mit dem Verkehrsmittel." } },
  "EASY_ahorrar_54": { "es": { "title": "Reutiliza bolsas", "description": "Lleva bolsas que ya tengas." }, "en": { "title": "Reuse bags", "description": "Take bags you already have." }, "de": { "title": "Taschen wiederverwenden", "description": "Nimm vorhandene Tüten/Taschen mit." } },
  "EASY_ahorrar_55": { "es": { "title": "Legumbres económicas", "description": "Cocina lentejas/garbanzos para varias raciones." }, "en": { "title": "Budget legumes", "description": "Cook lentils/chickpeas for several portions." }, "de": { "title": "Günstige Hülsenfrüchte", "description": "Koche Linsen/Kichererbsen für mehrere Portionen." } },
  "EASY_ahorrar_56": { "es": { "title": "Lista de suscripciones", "description": "Anota todas tus suscripciones activas." }, "en": { "title": "Subscriptions list", "description": "List all active subscriptions." }, "de": { "title": "Abo-Liste", "description": "Notiere alle aktiven Abos." } },
  "EASY_ahorrar_57": { "es": { "title": "TV sin standby", "description": "Desenchufa la TV por la noche." }, "en": { "title": "No TV standby", "description": "Unplug the TV overnight." }, "de": { "title": "Kein TV-Standby", "description": "Ziehe den Stecker des Fernsehers über Nacht." } },
  "EASY_ahorrar_58": { "es": { "title": "Cocina con despensa", "description": "Reto: cocina solo con lo que ya tienes." }, "en": { "title": "Pantry-only cooking", "description": "Challenge: cook only with what you have." }, "de": { "title": "Nur aus dem Vorrat kochen", "description": "Challenge: koche nur mit vorhandenen Zutaten." } },
  "EASY_ahorrar_59": { "es": { "title": "Sin apps de delivery", "description": "Evita comisiones y cocínalo en casa." }, "en": { "title": "No delivery apps", "description": "Skip fees and cook at home." }, "de": { "title": "Keine Liefer-Apps", "description": "Spare Gebühren und koche zu Hause." } },
  "EASY_ahorrar_60": { "es": { "title": "Evita comisiones de cajero", "description": "Saca efectivo solo en cajeros de tu banco." }, "en": { "title": "Avoid ATM fees", "description": "Withdraw cash only at your bank’s ATMs." }, "de": { "title": "Bankautomaten-Gebühren vermeiden", "description": "Hebe nur an Automaten deiner Bank ab." } },

  // 100 Tareas para Bajar Peso
  "HARD_weight_loss_001": { "es": { "title": "Camina 10,000 pasos", "description": "Alcanza 10,000 pasos para activar tu metabolismo." }, "en": { "title": "Walk 10,000 steps", "description": "Hit 10,000 steps to activate your metabolism." }, "de": { "title": "Gehe 10.000 Schritte", "description": "Erreiche 10.000 Schritte, um den Stoffwechsel anzuregen." } },
  "EASY_weight_loss_002": { "es": { "title": "Bebe 2 litros de agua", "description": "Mantén tu cuerpo hidratado durante todo el día." }, "en": { "title": "Drink 2 liters of water", "description": "Keep your body hydrated throughout the day." }, "de": { "title": "Trinke 2 Liter Wasser", "description": "Halte deinen Körper den ganzen Tag über hydriert." } },
  "EASY_weight_loss_003": { "es": { "title": "Come sin distracciones", "description": "Disfruta tu comida sin TV, móvil ni pantallas." }, "en": { "title": "Eat without distractions", "description": "Enjoy your meal without TV, phone, or screens." }, "de": { "title": "Ohne Ablenkungen essen", "description": "Genieße dein Essen ohne TV, Handy oder Bildschirme." } },
  "EASY_weight_loss_004": { "es": { "title": "Desayuna proteína", "description": "Incluye huevos, yogur griego o proteína en el desayuno." }, "en": { "title": "Protein for breakfast", "description": "Include eggs, Greek yogurt, or protein at breakfast." }, "de": { "title": "Proteinreich frühstücken", "description": "Integriere Eier, griechischen Joghurt oder Protein ins Frühstück." } },
  "MEDIUM_weight_loss_005": { "es": { "title": "Sube escaleras", "description": "Usa las escaleras al menos 3 veces hoy." }, "en": { "title": "Take the stairs", "description": "Use the stairs at least three times today." }, "de": { "title": "Treppen steigen", "description": "Nutze heute mindestens dreimal die Treppe." } },
  "EASY_weight_loss_006": { "es": { "title": "Evita azúcar añadida", "description": "No consumas alimentos con azúcares añadidos hoy." }, "en": { "title": "Avoid added sugar", "description": "Skip foods with added sugars today." }, "de": { "title": "Zuckerzusatz vermeiden", "description": "Verzichte heute auf Lebensmittel mit zugesetztem Zucker." } },
  "EASY_weight_loss_007": { "es": { "title": "Duerme 7–8 horas", "description": "Asegura un sueño reparador para regular hormonas." }, "en": { "title": "Sleep 7–8 hours", "description": "Get restorative sleep to balance your hormones." }, "de": { "title": "7–8 Stunden schlafen", "description": "Sorge für erholsamen Schlaf zur Hormonregulation." } },
  "MEDIUM_weight_loss_008": { "es": { "title": "Verduras en cada comida", "description": "Incluye al menos una porción de verduras en cada plato." }, "en": { "title": "Veggies at every meal", "description": "Include at least one serving of vegetables per plate." }, "de": { "title": "Gemüse zu jeder Mahlzeit", "description": "Füge zu jedem Teller mindestens eine Portion Gemüse hinzu." } },
  "MEDIUM_weight_loss_009": { "es": { "title": "Haz 20 sentadillas", "description": "Fortalece piernas y glúteos con 20 sentadillas." }, "en": { "title": "Do 20 squats", "description": "Strengthen legs and glutes with 20 squats." }, "de": { "title": "Mache 20 Kniebeugen", "description": "Stärke Beine und Gesäß mit 20 Kniebeugen." } },
  "EASY_weight_loss_010": { "es": { "title": "Medita 10 minutos", "description": "Reduce el estrés que desencadena el comer emocional." }, "en": { "title": "Meditate for 10 minutes", "description": "Lower stress that triggers emotional eating." }, "de": { "title": "10 Minuten meditieren", "description": "Reduziere Stress, der emotionales Essen auslöst." } },
  "MEDIUM_weight_loss_011": { "es": { "title": "Planifica tus comidas", "description": "Organiza el menú del día para evitar impulsos." }, "en": { "title": "Plan your meals", "description": "Plan your day’s menu to avoid impulsive choices." }, "de": { "title": "Mahlzeiten planen", "description": "Plane dein Tagesmenü, um Impulskäufe zu vermeiden." } },
  "EASY_weight_loss_012": { "es": { "title": "Camina tras cenar", "description": "Da un paseo de 15 minutos después de la última comida." }, "en": { "title": "Walk after dinner", "description": "Take a 15-minute walk after your last meal." }, "de": { "title": "Nach dem Abendessen gehen", "description": "Mache einen 15-minütigen Spaziergang nach der letzten Mahlzeit." } },
  "EASY_weight_loss_013": { "es": { "title": "Come fruta fresca", "description": "Elige fruta entera en lugar de jugos." }, "en": { "title": "Eat fresh fruit", "description": "Choose whole fruit instead of juices." }, "de": { "title": "Frisches Obst essen", "description": "Wähle ganzes Obst statt Säfte." } },
  "MEDIUM_weight_loss_014": { "es": { "title": "Haz 10 flexiones", "description": "Fortalece el tren superior con 10 flexiones." }, "en": { "title": "Do 10 push-ups", "description": "Strengthen your upper body with 10 push-ups." }, "de": { "title": "Mache 10 Liegestütze", "description": "Stärke den Oberkörper mit 10 Liegestützen." } },
  "EASY_weight_loss_015": { "es": { "title": "Pésate a la misma hora", "description": "Registra tu peso en ayunas para ver el progreso." }, "en": { "title": "Weigh in at the same time", "description": "Record a fasted weight to track progress." }, "de": { "title": "Zur gleichen Zeit wiegen", "description": "Dokumentiere dein Nüchterngewicht für den Fortschritt." } },
  "MEDIUM_weight_loss_016": { "es": { "title": "Cocina en casa", "description": "Prepara al menos dos comidas caseras hoy." }, "en": { "title": "Cook at home", "description": "Make at least two home-cooked meals today." }, "de": { "title": "Zu Hause kochen", "description": "Bereite heute mindestens zwei hausgemachte Mahlzeiten zu." } },
  "EASY_weight_loss_017": { "es": { "title": "Lee etiquetas", "description": "Revisa calorías e ingredientes antes de comprar." }, "en": { "title": "Read labels", "description": "Check calories and ingredients before buying." }, "de": { "title": "Etiketten lesen", "description": "Prüfe Kalorien und Zutaten vor dem Kauf." } },
  "HARD_weight_loss_018": { "es": { "title": "Haz 30 burpees", "description": "Quema calorías con un ejercicio de cuerpo completo." }, "en": { "title": "Do 30 burpees", "description": "Burn calories with a full-body exercise." }, "de": { "title": "Mache 30 Burpees", "description": "Verbrenne Kalorien mit einer Ganzkörperübung." } },
  "EASY_weight_loss_019": { "es": { "title": "Usa platos pequeños", "description": "Controla porciones usando platos más pequeños." }, "en": { "title": "Use smaller plates", "description": "Control portions by using smaller plates." }, "de": { "title": "Kleinere Teller nutzen", "description": "Kontrolliere Portionen mit kleineren Tellern." } },
  "EASY_weight_loss_020": { "es": { "title": "Mastica despacio", "description": "Mastica al menos 20 veces cada bocado." }, "en": { "title": "Chew slowly", "description": "Chew each bite at least 20 times." }, "de": { "title": "Langsam kauen", "description": "Kaue jeden Bissen mindestens 20-mal." } },
  "MEDIUM_weight_loss_021": { "es": { "title": "Yoga 20 minutos", "description": "Mejora flexibilidad y reduce el estrés." }, "en": { "title": "20 minutes of yoga", "description": "Improve flexibility and reduce stress." }, "de": { "title": "20 Minuten Yoga", "description": "Verbessere die Flexibilität und reduziere Stress." } },
  "EASY_weight_loss_022": { "es": { "title": "Evita alcohol hoy", "description": "Elimina calorías vacías del alcohol." }, "en": { "title": "Skip alcohol today", "description": "Cut empty calories from alcohol." }, "de": { "title": "Heute keinen Alkohol", "description": "Spare leere Kalorien aus Alkohol." } },
  "EASY_weight_loss_023": { "es": { "title": "Grasas saludables", "description": "Incluye aguacate, nueces o aceite de oliva." }, "en": { "title": "Healthy fats", "description": "Add avocado, nuts, or olive oil." }, "de": { "title": "Gesunde Fette", "description": "Füge Avocado, Nüsse oder Olivenöl hinzu." } },
  "MEDIUM_weight_loss_024": { "es": { "title": "50 jumping jacks", "description": "Activa tu sistema cardiovascular con saltos." }, "en": { "title": "50 jumping jacks", "description": "Boost your cardio with jumping jacks." }, "de": { "title": "50 Hampelmänner", "description": "Aktiviere dein Herz-Kreislauf-System mit Hampelmännern." } },
  "EASY_weight_loss_025": { "es": { "title": "Bebe té verde", "description": "Aprovecha sus antioxidantes." }, "en": { "title": "Drink green tea", "description": "Benefit from its antioxidants." }, "de": { "title": "Grünen Tee trinken", "description": "Profitiere von den Antioxidantien." } },
  "EASY_weight_loss_026": { "es": { "title": "Lista de compras", "description": "Planifica compras para evitar tentaciones." }, "en": { "title": "Make a shopping list", "description": "Plan purchases to avoid temptations." }, "de": { "title": "Einkaufsliste erstellen", "description": "Plane Einkäufe, um Versuchungen zu vermeiden." } },
  "HARD_weight_loss_027": { "es": { "title": "Corre 15 minutos", "description": "Corre o trota en sitio durante 15 minutos." }, "en": { "title": "Run for 15 minutes", "description": "Run or jog in place for 15 minutes." }, "de": { "title": "15 Minuten laufen", "description": "Laufe oder jogge 15 Minuten (auch auf der Stelle)." } },
  "MEDIUM_weight_loss_028": { "es": { "title": "Come pescado azul", "description": "Incluye salmón, atún o sardinas." }, "en": { "title": "Eat oily fish", "description": "Include salmon, tuna, or sardines." }, "de": { "title": "Fettreichen Fisch essen", "description": "Integriere Lachs, Thunfisch oder Sardinen." } },
  "MEDIUM_weight_loss_029": { "es": { "title": "Plancha 1 minuto", "description": "Fortalece el core con una plancha de 60 s." }, "en": { "title": "1-minute plank", "description": "Strengthen your core with a 60-second plank." }, "de": { "title": "1-Minute Plank", "description": "Stärke den Core mit einer 60-Sekunden-Plank." } },
  "MEDIUM_weight_loss_030": { "es": { "title": "Evita fritos", "description": "Elige métodos de cocción más saludables." }, "en": { "title": "Avoid fried food", "description": "Choose healthier cooking methods." }, "de": { "title": "Frittiertes vermeiden", "description": "Wähle gesündere Garmethoden." } },
  "EASY_weight_loss_031": { "es": { "title": "Sol 15 minutos", "description": "Sintetiza vitamina D para tu metabolismo." }, "en": { "title": "15 minutes of sun", "description": "Synthesize vitamin D for metabolism support." }, "de": { "title": "15 Minuten Sonne", "description": "Unterstütze den Stoffwechsel mit Vitamin D." } },
  "HARD_weight_loss_032": { "es": { "title": "100 abdominales", "description": "Divide en series y cuida la técnica." }, "en": { "title": "100 sit-ups", "description": "Split into sets and keep good form." }, "de": { "title": "100 Sit-ups", "description": "Teile in Sätze auf und achte auf die Technik." } },
  "EASY_weight_loss_033": { "es": { "title": "Nueces naturales", "description": "Toma 30 g de nueces sin sal como snack." }, "en": { "title": "Natural nuts", "description": "Have 30 g of unsalted nuts as a snack." }, "de": { "title": "Natürliche Nüsse", "description": "Iss 30 g ungesalzene Nüsse als Snack." } },
  "EASY_weight_loss_034": { "es": { "title": "Agua antes de comer", "description": "Bebe un vaso 20 minutos antes de cada comida." }, "en": { "title": "Water before meals", "description": "Drink a glass 20 minutes before each meal." }, "de": { "title": "Wasser vor dem Essen", "description": "Trinke 20 Minuten vor jeder Mahlzeit ein Glas Wasser." } },
  "EASY_weight_loss_035": { "es": { "title": "Estiramientos", "description": "Dedica 15 minutos a estirar todo el cuerpo." }, "en": { "title": "Stretching", "description": "Spend 15 minutes stretching your whole body." }, "de": { "title": "Dehnen", "description": "Dehne 15 Minuten den ganzen Körper." } },
  "MEDIUM_weight_loss_036": { "es": { "title": "Lentejas o legumbres", "description": "Aporta proteína vegetal y fibra." }, "en": { "title": "Lentils or legumes", "description": "Add plant protein and fiber." }, "de": { "title": "Linsen oder Hülsenfrüchte", "description": "Bringe pflanzliches Eiweiß und Ballaststoffe ein." } },
  "MEDIUM_weight_loss_037": { "es": { "title": "Saltar la cuerda 10′", "description": "Quema calorías con cardio eficaz." }, "en": { "title": "Jump rope 10 min", "description": "Burn calories with efficient cardio." }, "de": { "title": "10 Min Seilspringen", "description": "Verbrenne Kalorien mit effektivem Cardio." } },
  "EASY_weight_loss_038": { "es": { "title": "Evita bebidas azucaradas", "description": "Nada de refrescos o energéticas hoy." }, "en": { "title": "Skip sugary drinks", "description": "No sodas or energy drinks today." }, "de": { "title": "Zuckergetränke meiden", "description": "Heute keine Softdrinks oder Energydrinks." } },
  "MEDIUM_weight_loss_039": { "es": { "title": "Batch cooking", "description": "Cocina varias comidas saludables para la semana." }, "en": { "title": "Batch cooking", "description": "Cook several healthy meals for the week." }, "de": { "title": "Vorkochen", "description": "Bereite mehrere gesunde Mahlzeiten für die Woche vor." } },
  "HARD_weight_loss_040": { "es": { "title": "Ciclismo 30 minutos", "description": "Pedalea al aire libre o en estática." }, "en": { "title": "Cycle for 30 minutes", "description": "Ride outdoors or on a stationary bike." }, "de": { "title": "30 Minuten Radfahren", "description": "Fahre draußen oder auf dem Heimtrainer." } },
  "EASY_weight_loss_041": { "es": { "title": "Come en 20 minutos", "description": "Dedica al menos 20 minutos a cada comida." }, "en": { "title": "Eat in 20 minutes", "description": "Spend at least 20 minutes per meal." }, "de": { "title": "In 20 Minuten essen", "description": "Nimm dir pro Mahlzeit mindestens 20 Minuten." } },
  "MEDIUM_weight_loss_042": { "es": { "title": "Zancadas", "description": "3 series de 15 por pierna." }, "en": { "title": "Lunges", "description": "3 sets of 15 per leg." }, "de": { "title": "Ausfallschritte", "description": "3 Sätze à 15 pro Bein." } },
  "EASY_weight_loss_043": { "es": { "title": "Café solo", "description": "Evita azúcar y cremas." }, "en": { "title": "Black coffee", "description": "Skip sugar and cream." }, "de": { "title": "Schwarzer Kaffee", "description": "Ohne Zucker und Sahne." } },
  "MEDIUM_weight_loss_044": { "es": { "title": "Baila 30 minutos", "description": "Quema calorías divirtiéndote." }, "en": { "title": "Dance for 30 minutes", "description": "Burn calories while having fun." }, "de": { "title": "30 Minuten tanzen", "description": "Verbrenne Kalorien mit Spaß." } },
  "MEDIUM_weight_loss_045": { "es": { "title": "Quinoa o avena", "description": "Incluye cereales integrales." }, "en": { "title": "Quinoa or oats", "description": "Include whole grains." }, "de": { "title": "Quinoa oder Hafer", "description": "Integriere Vollkorngetreide." } },
  "HARD_weight_loss_046": { "es": { "title": "Ejercicio en ayunas", "description": "Entrena 20 minutos antes del desayuno." }, "en": { "title": "Fasted workout", "description": "Train 20 minutes before breakfast." }, "de": { "title": "Nüchtern trainieren", "description": "Trainiere 20 Minuten vor dem Frühstück." } },
  "EASY_weight_loss_047": { "es": { "title": "Evita pan blanco", "description": "Elige integral o prescinde hoy." }, "en": { "title": "Avoid white bread", "description": "Choose whole-grain or skip it today." }, "de": { "title": "Weißbrot meiden", "description": "Wähle Vollkorn oder lass es heute weg." } },
  "HARD_weight_loss_048": { "es": { "title": "Nada 30 minutos", "description": "Bajo impacto y alta efectividad." }, "en": { "title": "Swim for 30 minutes", "description": "Low impact, high effectiveness." }, "de": { "title": "30 Minuten schwimmen", "description": "Geringe Belastung, hohe Wirkung." } },
  "EASY_weight_loss_049": { "es": { "title": "Brócoli al vapor", "description": "Inclúyelo como guarnición o plato." }, "en": { "title": "Steamed broccoli", "description": "Add it as a side or main." }, "de": { "title": "Gedämpfter Brokkoli", "description": "Als Beilage oder Hauptgericht hinzufügen." } },
  "HARD_weight_loss_050": { "es": { "title": "HIIT 15 minutos", "description": "Intervalos de alta intensidad controlada." }, "en": { "title": "15-minute HIIT", "description": "High-intensity intervals with control." }, "de": { "title": "15 Minuten HIIT", "description": "Hochintensive Intervalle mit Kontrolle." } },
  "EASY_weight_loss_051": { "es": { "title": "Vinagre de manzana", "description": "Una cucharada en agua antes de comer." }, "en": { "title": "Apple cider vinegar", "description": "One tablespoon in water before meals." }, "de": { "title": "Apfelessig", "description": "Ein Esslöffel in Wasser vor dem Essen." } },
  "HARD_weight_loss_052": { "es": { "title": "Mountain climbers", "description": "3 series de 20 repeticiones." }, "en": { "title": "Mountain climbers", "description": "3 sets of 20 reps." }, "de": { "title": "Mountain Climbers", "description": "3 Sätze à 20 Wiederholungen." } },
  "EASY_weight_loss_053": { "es": { "title": "Huevos duros", "description": "Snack proteico y saciante." }, "en": { "title": "Boiled eggs", "description": "A protein-rich, filling snack." }, "de": { "title": "Gekochte Eier", "description": "Proteinreicher, sättigender Snack." } },
  "EASY_weight_loss_054": { "es": { "title": "Camina descalzo", "description": "Conecta con la tierra 15 minutos." }, "en": { "title": "Walk barefoot", "description": "Ground yourself for 15 minutes." }, "de": { "title": "Barfuß gehen", "description": "15 Minuten erden und verbinden." } },
  "EASY_weight_loss_055": { "es": { "title": "Evita snacks procesados", "description": "Nada de galletas, chips o dulces industriales." }, "en": { "title": "Avoid processed snacks", "description": "Skip cookies, chips, and candy." }, "de": { "title": "Verarbeitete Snacks meiden", "description": "Keine Kekse, Chips oder Süßigkeiten." } },
  "MEDIUM_weight_loss_056": { "es": { "title": "Boxing shadow", "description": "Boxea en el aire durante 15 minutos." }, "en": { "title": "Shadow boxing", "description": "Box in the air for 15 minutes." }, "de": { "title": "Schattenboxen", "description": "15 Minuten in die Luft boxen." } },
  "EASY_weight_loss_057": { "es": { "title": "Espinacas frescas", "description": "Añádelas a ensaladas o batidos." }, "en": { "title": "Fresh spinach", "description": "Add to salads or smoothies." }, "de": { "title": "Frischer Spinat", "description": "Zu Salaten oder Smoothies hinzufügen." } },
  "MEDIUM_weight_loss_058": { "es": { "title": "Sube y baja banco", "description": "Step-ups: 3 series de 15 por pierna." }, "en": { "title": "Step-ups", "description": "3 sets of 15 per leg." }, "de": { "title": "Step-ups", "description": "3 Sätze à 15 pro Bein." } },
  "EASY_weight_loss_059": { "es": { "title": "Agua con limón", "description": "Empieza el día con agua tibia y limón." }, "en": { "title": "Lemon water", "description": "Start your day with warm lemon water." }, "de": { "title": "Wasser mit Zitrone", "description": "Starte den Tag mit warmem Zitronenwasser." } },
  "MEDIUM_weight_loss_060": { "es": { "title": "Sentadillas sumo", "description": "3 series de 20 repeticiones." }, "en": { "title": "Sumo squats", "description": "3 sets of 20 reps." }, "de": { "title": "Sumo-Kniebeugen", "description": "3 Sätze à 20 Wiederholungen." } },
  "EASY_weight_loss_061": { "es": { "title": "Pepino y zanahoria", "description": "Snack crujiente y bajo en calorías." }, "en": { "title": "Cucumber & carrot", "description": "A crunchy, low-calorie snack." }, "de": { "title": "Gurke & Karotte", "description": "Knuspriger, kalorienarmer Snack." } },
  "HARD_weight_loss_062": { "es": { "title": "Jumping lunges", "description": "Ejercicio explosivo: 3×10 por lado." }, "en": { "title": "Jumping lunges", "description": "Explosive move: 3×10 per side." }, "de": { "title": "Sprung-Ausfallschritte", "description": "Explosiv: 3×10 pro Seite." } },
  "EASY_weight_loss_063": { "es": { "title": "Evita lácteos enteros", "description": "Elige desnatados o vegetales." }, "en": { "title": "Skip full-fat dairy", "description": "Choose low-fat or plant-based options." }, "de": { "title": "Vollfett-Milchprodukte meiden", "description": "Wähle fettarme oder pflanzliche Alternativen." } },
  "MEDIUM_weight_loss_064": { "es": { "title": "Remo con banda", "description": "Ejercita la espalda con banda elástica." }, "en": { "title": "Band rows", "description": "Work your back with a resistance band." }, "de": { "title": "Rudern mit Band", "description": "Trainiere den Rücken mit einem Fitnessband." } },
  "EASY_weight_loss_065": { "es": { "title": "Tomate natural", "description": "Bajo en calorías y rico en licopeno." }, "en": { "title": "Fresh tomato", "description": "Low-calorie and rich in lycopene." }, "de": { "title": "Frische Tomate", "description": "Kalorienarm und lycopinreich." } },
  "MEDIUM_weight_loss_066": { "es": { "title": "Wall sits", "description": "Mantén 3 veces 45 segundos." }, "en": { "title": "Wall sits", "description": "Hold 3 × 45 seconds." }, "de": { "title": "Wandsitz", "description": "Halte 3×45 Sekunden." } },
  "EASY_weight_loss_067": { "es": { "title": "Infusión digestiva", "description": "Manzanilla, jengibre o menta tras comer." }, "en": { "title": "Digestive tea", "description": "Chamomile, ginger, or mint after meals." }, "de": { "title": "Verdauungstee", "description": "Kamille, Ingwer oder Minze nach dem Essen." } },
  "HARD_weight_loss_068": { "es": { "title": "Escaladores laterales", "description": "Cross-body: 3 series de 15." }, "en": { "title": "Cross-body climbers", "description": "3 sets of 15 reps." }, "de": { "title": "Seitliche Mountain Climbers", "description": "3 Sätze à 15 Wiederholungen." } },
  "EASY_weight_loss_069": { "es": { "title": "Apio con hummus", "description": "Snack nutritivo y saciante." }, "en": { "title": "Celery with hummus", "description": "A nutritious, filling snack." }, "de": { "title": "Sellerie mit Hummus", "description": "Nahrhafter, sättigender Snack." } },
  "MEDIUM_weight_loss_070": { "es": { "title": "Fondos de tríceps", "description": "Usa una silla: 3 series de 12." }, "en": { "title": "Tricep dips", "description": "Use a chair: 3 sets of 12." }, "de": { "title": "Trizeps-Dips", "description": "Mit Stuhl: 3 Sätze à 12." } },
  "EASY_weight_loss_071": { "es": { "title": "Cena temprano", "description": "Evita comer 3 horas antes de dormir." }, "en": { "title": "Eat early", "description": "Avoid eating 3 hours before bed." }, "de": { "title": "Früh essen", "description": "Iss 3 Stunden vor dem Schlafen nichts mehr." } },
  "MEDIUM_weight_loss_072": { "es": { "title": "Peso muerto", "description": "Con botellas o pesas: 3 series de 15." }, "en": { "title": "Deadlifts", "description": "Use bottles or weights: 3×15." }, "de": { "title": "Kreuzheben", "description": "Mit Flaschen oder Gewichten: 3×15." } },
  "EASY_weight_loss_073": { "es": { "title": "Calabacín al horno", "description": "Ligero y muy versátil." }, "en": { "title": "Baked zucchini", "description": "Light and very versatile." }, "de": { "title": "Gebackene Zucchini", "description": "Leicht und vielseitig." } },
  "HARD_weight_loss_074": { "es": { "title": "Duck walks", "description": "Camina en cuclillas durante 2 minutos." }, "en": { "title": "Duck walks", "description": "Walk in a squat for 2 minutes." }, "de": { "title": "Entengang", "description": "Gehe 2 Minuten in der Hocke." } },
  "MEDIUM_weight_loss_075": { "es": { "title": "Probióticos naturales", "description": "Yogur, kéfir o chucrut." }, "en": { "title": "Natural probiotics", "description": "Yogurt, kefir, or sauerkraut." }, "de": { "title": "Natürliche Probiotika", "description": "Joghurt, Kefir oder Sauerkraut." } },
  "MEDIUM_weight_loss_076": { "es": { "title": "Bicycle crunches", "description": "3 series de 20 repeticiones." }, "en": { "title": "Bicycle crunches", "description": "3 sets of 20 reps." }, "de": { "title": "Fahrrad-Crunches", "description": "3 Sätze à 20 Wiederholungen." } },
  "MEDIUM_weight_loss_077": { "es": { "title": "Pechuga de pollo", "description": "Proteína magra a la plancha o al horno." }, "en": { "title": "Chicken breast", "description": "Lean protein, grilled or baked." }, "de": { "title": "Hähnchenbrust", "description": "Mageres Protein, gegrillt oder gebacken." } },
  "MEDIUM_weight_loss_078": { "es": { "title": "Skaters", "description": "Saltos laterales: 3 series de 20." }, "en": { "title": "Skaters", "description": "Lateral jumps: 3×20." }, "de": { "title": "Skater-Sprünge", "description": "Seitliche Sprünge: 3×20." } },
  "EASY_weight_loss_079": { "es": { "title": "Sin salsas comerciales", "description": "Usa especias y hierbas frescas." }, "en": { "title": "Skip store-bought sauces", "description": "Use spices and fresh herbs instead." }, "de": { "title": "Fertigsaucen meiden", "description": "Nutze stattdessen Gewürze und frische Kräuter." } },
  "MEDIUM_weight_loss_080": { "es": { "title": "Inchworms", "description": "Movilidad: 3 series de 10." }, "en": { "title": "Inchworms", "description": "Mobility exercise: 3×10." }, "de": { "title": "Inchworms", "description": "Mobilitätsübung: 3×10." } },
  "EASY_weight_loss_081": { "es": { "title": "Batido verde", "description": "Espinacas, plátano, manzana y agua." }, "en": { "title": "Green smoothie", "description": "Spinach, banana, apple, and water." }, "de": { "title": "Grüner Smoothie", "description": "Spinat, Banane, Apfel und Wasser." } },
  "MEDIUM_weight_loss_082": { "es": { "title": "Goblet squats", "description": "Sentadillas con peso: 3×15." }, "en": { "title": "Goblet squats", "description": "Weighted squats: 3×15." }, "de": { "title": "Goblet-Kniebeugen", "description": "Kniebeugen mit Gewicht: 3×15." } },
  "EASY_weight_loss_083": { "es": { "title": "Canela en infusión", "description": "Ayuda a regular el azúcar en sangre." }, "en": { "title": "Cinnamon tea", "description": "May help regulate blood sugar." }, "de": { "title": "Zimttee", "description": "Kann den Blutzucker regulieren helfen." } },
  "HARD_weight_loss_084": { "es": { "title": "Pike push-ups", "description": "3 series de 10 repeticiones." }, "en": { "title": "Pike push-ups", "description": "3 sets of 10 reps." }, "de": { "title": "Pike-Liegestütze", "description": "3 Sätze à 10 Wiederholungen." } },
  "EASY_weight_loss_085": { "es": { "title": "Edamame", "description": "Soja verde rica en proteína." }, "en": { "title": "Edamame", "description": "Protein-rich green soybeans." }, "de": { "title": "Edamame", "description": "Proteinreiche grüne Sojabohnen." } },
  "HARD_weight_loss_086": { "es": { "title": "Jumping squats", "description": "Sentadillas con salto: 3×12." }, "en": { "title": "Jumping squats", "description": "Squat jumps: 3×12." }, "de": { "title": "Sprung-Kniebeugen", "description": "Kniebeugen mit Sprung: 3×12." } },
  "EASY_weight_loss_087": { "es": { "title": "Evita embutidos", "description": "Elige proteínas magras y frescas." }, "en": { "title": "Avoid cold cuts", "description": "Choose fresh, lean proteins instead." }, "de": { "title": "Wurstwaren meiden", "description": "Wähle stattdessen frische, magere Proteine." } },
  "HARD_weight_loss_088": { "es": { "title": "Bear crawls", "description": "3 series de 30 segundos." }, "en": { "title": "Bear crawls", "description": "3 sets of 30 seconds." }, "de": { "title": "Bärenlauf", "description": "3 Sätze à 30 Sekunden." } },
  "EASY_weight_loss_089": { "es": { "title": "Pimientos asados", "description": "Ricos en vitamina C y fibra." }, "en": { "title": "Roasted peppers", "description": "Rich in vitamin C and fiber." }, "de": { "title": "Geröstete Paprika", "description": "Reich an Vitamin C und Ballaststoffen." } },
  "MEDIUM_weight_loss_090": { "es": { "title": "Russian twists", "description": "Giros rusos: 3×20." }, "en": { "title": "Russian twists", "description": "3 sets of 20 twists." }, "de": { "title": "Russian Twists", "description": "3 Sätze à 20 Drehungen." } },
  "EASY_weight_loss_091": { "es": { "title": "Agua de coco", "description": "Hidratación natural sin azúcares añadidos." }, "en": { "title": "Coconut water", "description": "Natural hydration without added sugars." }, "de": { "title": "Kokoswasser", "description": "Natürliche Hydration ohne zugesetzten Zucker." } },
  "HARD_weight_loss_092": { "es": { "title": "Pistol squats", "description": "Sentadilla a una pierna: 3×5 por lado." }, "en": { "title": "Pistol squats", "description": "One-leg squats: 3×5 per side." }, "de": { "title": "Pistol Squats", "description": "Einbeinige Kniebeugen: 3×5 pro Seite." } },
  "EASY_weight_loss_093": { "es": { "title": "Champiñones", "description": "Bajos en calorías y nutritivos." }, "en": { "title": "Mushrooms", "description": "Low-calorie and nutrient-rich." }, "de": { "title": "Champignons", "description": "Kalorienarm und nährstoffreich." } },
  "HARD_weight_loss_094": { "es": { "title": "Plank jacks", "description": "Plancha con saltos: 3×15." }, "en": { "title": "Plank jacks", "description": "3 sets of 15 plank jacks." }, "de": { "title": "Plank Jacks", "description": "3 Sätze à 15 Plank-Sprünge." } },
  "EASY_weight_loss_095": { "es": { "title": "Sin postres azucarados", "description": "Elige fruta fresca como postre." }, "en": { "title": "Skip sugary desserts", "description": "Choose fresh fruit instead." }, "de": { "title": "Keine zuckrigen Desserts", "description": "Wähle stattdessen frisches Obst." } },
  "MEDIUM_weight_loss_096": { "es": { "title": "Donkey kicks", "description": "3 series de 15 por pierna." }, "en": { "title": "Donkey kicks", "description": "3 sets of 15 per leg." }, "de": { "title": "Donkey Kicks", "description": "3 Sätze à 15 pro Bein." } },
  "EASY_weight_loss_097": { "es": { "title": "Col rizada", "description": "Kale en ensalada o al vapor." }, "en": { "title": "Kale", "description": "Enjoy in a salad or steamed." }, "de": { "title": "Grünkohl", "description": "Als Salat oder gedämpft genießen." } },
  "HARD_weight_loss_098": { "es": { "title": "Tuck jumps", "description": "Saltos con rodillas al pecho: 3×10." }, "en": { "title": "Tuck jumps", "description": "Knees-to-chest jumps: 3×10." }, "de": { "title": "Tuck Jumps", "description": "Knie-zur-Brust-Sprünge: 3×10." } },
  "EASY_weight_loss_099": { "es": { "title": "Cúrcuma con pimienta", "description": "Antiinflamatorio natural sencillo." }, "en": { "title": "Turmeric with pepper", "description": "A simple natural anti-inflammatory." }, "de": { "title": "Kurkuma mit Pfeffer", "description": "Ein einfaches, natürliches Antientzündungsmittel." } },
  "HARD_weight_loss_100": { "es": { "title": "Box jumps", "description": "Saltos al cajón: 3×12." }, "en": { "title": "Box jumps", "description": "Jump onto a box or step: 3×12." }, "de": { "title": "Box Jumps", "description": "Sprünge auf die Box oder Stufe: 3×12." } },


  // Mejorar el medio ambiente 
  "EASY_ambiente_1": { "es": { "title": "Usa una bolsa reutilizable", "description": "Evita plásticos de un solo uso al hacer compras." }, "en": { "title": "Use a reusable bag", "description": "Avoid single-use plastics when shopping." }, "de": { "title": "Verwende eine wiederverwendbare Tasche", "description": "Vermeide Einwegplastik beim Einkaufen." } },
  "EASY_ambiente_2": { "es": { "title": "Recicla correctamente", "description": "Separa tus residuos según las normas locales." }, "en": { "title": "Recycle properly", "description": "Separate your waste according to local rules." }, "de": { "title": "Richtig recyceln", "description": "Trenne deinen Müll nach lokalen Vorgaben." } },
  "EASY_ambiente_3": { "es": { "title": "Reduce el consumo de agua", "description": "Cierra el grifo mientras te cepillas los dientes." }, "en": { "title": "Reduce water use", "description": "Turn off the tap while brushing your teeth." }, "de": { "title": "Wasserverbrauch reduzieren", "description": "Wasserhahn beim Zähneputzen zudrehen." } },
  "EASY_ambiente_4": { "es": { "title": "Comida sin carne", "description": "Elige una comida vegetariana para bajar tu huella." }, "en": { "title": "Meat-free meal", "description": "Choose a vegetarian meal to lower your footprint." }, "de": { "title": "Fleischfreie Mahlzeit", "description": "Wähle eine vegetarische Mahlzeit für einen kleineren Fußabdruck." } },
  "EASY_ambiente_5": { "es": { "title": "Apaga luces innecesarias", "description": "Ahorra energía apagando lo que no uses." }, "en": { "title": "Turn off unnecessary lights", "description": "Save energy by switching off what you don't use." }, "de": { "title": "Unnötiges Licht ausschalten", "description": "Energie sparen, indem unbenutztes Licht aus ist." } },
  "MEDIUM_ambiente_6": { "es": { "title": "Camina o usa bici", "description": "Muévete hoy sin emisiones siempre que puedas." }, "en": { "title": "Walk or bike today", "description": "Choose emission-free transport whenever you can." }, "de": { "title": "Zu Fuß oder mit dem Rad", "description": "Heute nach Möglichkeit ohne Emissionen unterwegs sein." } },
  "MEDIUM_ambiente_7": { "es": { "title": "Compra productos locales", "description": "Reduce transporte eligiendo cercanía." }, "en": { "title": "Buy local products", "description": "Cut transport emissions by choosing nearby." }, "de": { "title": "Regionale Produkte kaufen", "description": "Transportwege verkürzen durch regionale Auswahl." } },
  "EASY_ambiente_8": { "es": { "title": "Evita exceso de empaque", "description": "Prefiere productos a granel o con poco envase." }, "en": { "title": "Avoid over-packaging", "description": "Choose bulk or low-packaging options." }, "de": { "title": "Übermäßige Verpackung vermeiden", "description": "Lose oder wenig verpackte Produkte wählen." } },
  "MEDIUM_ambiente_9": { "es": { "title": "Lleva tu propia taza", "description": "Evita vasos desechables en la cafetería." }, "en": { "title": "Bring your own cup", "description": "Skip disposable cups at the café." }, "de": { "title": "Eigene Tasse mitnehmen", "description": "Einwegbecher im Café vermeiden." } },
  "HARD_ambiente_10": { "es": { "title": "Compostea orgánicos", "description": "Reduce basura y crea abono natural." }, "en": { "title": "Compost organics", "description": "Cut waste and create natural fertilizer." }, "de": { "title": "Bioabfall kompostieren", "description": "Müll reduzieren und natürlichen Dünger gewinnen." } },
  "EASY_ambiente_11": { "es": { "title": "Desconecta aparatos", "description": "Evita el consumo fantasma de energía." }, "en": { "title": "Unplug devices", "description": "Avoid phantom power use." }, "de": { "title": "Geräte vom Strom trennen", "description": "Standby-Verbrauch vermeiden." } },
  "MEDIUM_ambiente_12": { "es": { "title": "Limpieza ecológica", "description": "Usa productos con menos químicos dañinos." }, "en": { "title": "Eco-friendly cleaners", "description": "Use products with fewer harmful chemicals." }, "de": { "title": "Umweltfreundliche Reiniger", "description": "Produkte mit weniger schädlichen Chemikalien nutzen." } },
  "MEDIUM_ambiente_13": { "es": { "title": "Repara en vez de tirar", "description": "Alarga la vida útil de tus objetos." }, "en": { "title": "Repair, don’t replace", "description": "Extend the lifespan of your items." }, "de": { "title": "Reparieren statt wegwerfen", "description": "Lebensdauer deiner Dinge verlängern." } },
  "MEDIUM_ambiente_14": { "es": { "title": "Planta o cuida una planta", "description": "Genera oxígeno y absorbe CO₂." }, "en": { "title": "Plant or care for a plant", "description": "Create oxygen and absorb CO₂." }, "de": { "title": "Pflanze setzen oder pflegen", "description": "Sauerstoff erzeugen und CO₂ binden." } },
  "MEDIUM_ambiente_15": { "es": { "title": "Usa servilletas de tela", "description": "Reemplaza las de papel desechables." }, "en": { "title": "Use cloth napkins", "description": "Replace disposable paper ones." }, "de": { "title": "Stoffservietten verwenden", "description": "Papier-Einwegware ersetzen." } },
  "MEDIUM_ambiente_16": { "es": { "title": "Compra de segunda mano", "description": "Reduce la producción de artículos nuevos." }, "en": { "title": "Buy second-hand", "description": "Reduce production of new goods." }, "de": { "title": "Secondhand kaufen", "description": "Produktion neuer Waren verringern." } },
  "EASY_ambiente_17": { "es": { "title": "Duchas más cortas", "description": "Ahorra agua caliente con duchas breves." }, "en": { "title": "Shorter showers", "description": "Save hot water with brief showers." }, "de": { "title": "Kürzer duschen", "description": "Warmwasser mit kurzen Duschen sparen." } },
  "EASY_ambiente_18": { "es": { "title": "Sin popotes de plástico", "description": "Recházalos o lleva uno reutilizable." }, "en": { "title": "Skip plastic straws", "description": "Refuse or bring a reusable one." }, "de": { "title": "Keine Plastikstrohhalme", "description": "Ablehnen oder wiederverwendbaren nutzen." } },
  "MEDIUM_ambiente_19": { "es": { "title": "Dona ropa que no uses", "description": "Dale una segunda vida útil." }, "en": { "title": "Donate unused clothes", "description": "Give garments a second life." }, "de": { "title": "Ungetragene Kleidung spenden", "description": "Den Stücken ein zweites Leben geben." } },
  "MEDIUM_ambiente_20": { "es": { "title": "Usa baterías recargables", "description": "Reduce residuos tóxicos a largo plazo." }, "en": { "title": "Use rechargeable batteries", "description": "Reduce toxic waste over time." }, "de": { "title": "Akkus verwenden", "description": "Langfristig giftigen Abfall reduzieren." } },
  "MEDIUM_ambiente_21": { "es": { "title": "Compra a granel", "description": "Minimiza envases y desperdicio." }, "en": { "title": "Buy in bulk", "description": "Minimize packaging and waste." }, "de": { "title": "Unverpackt/lose kaufen", "description": "Verpackung und Abfall minimieren." } },
  "MEDIUM_ambiente_22": { "es": { "title": "Pañuelos de tela", "description": "Reemplaza los desechables." }, "en": { "title": "Cloth handkerchiefs", "description": "Replace disposable tissues." }, "de": { "title": "Stofftaschentücher", "description": "Einwegtücher ersetzen." } },
  "MEDIUM_ambiente_23": { "es": { "title": "Recoge basura en la calle", "description": "Cada acción cuenta para tu entorno." }, "en": { "title": "Pick up litter", "description": "Every small action helps your area." }, "de": { "title": "Müll aufsammeln", "description": "Jede kleine Aktion hilft der Umgebung." } },
  "HARD_ambiente_24": { "es": { "title": "Instala iluminación LED", "description": "Consume hasta 80% menos energía." }, "en": { "title": "Switch to LED lighting", "description": "Use up to 80% less energy." }, "de": { "title": "Auf LED-Beleuchtung umstellen", "description": "Bis zu 80 % weniger Energieverbrauch." } },
  "MEDIUM_ambiente_25": { "es": { "title": "Evita el fast fashion", "description": "Compra ropa de calidad y duradera." }, "en": { "title": "Avoid fast fashion", "description": "Choose quality, long-lasting clothes." }, "de": { "title": "Fast Fashion vermeiden", "description": "Hochwertige, langlebige Kleidung wählen." } },
  "EASY_ambiente_26": { "es": { "title": "Lava con agua fría", "description": "Reduce el gasto energético del lavado." }, "en": { "title": "Wash with cold water", "description": "Lower the energy used for laundry." }, "de": { "title": "Kalt waschen", "description": "Energie beim Waschen sparen." } },
  "MEDIUM_ambiente_27": { "es": { "title": "Apoya negocios sostenibles", "description": "Vota con tu dinero por mejores prácticas." }, "en": { "title": "Support sustainable businesses", "description": "Vote with your wallet for better practices." }, "de": { "title": "Nachhaltige Unternehmen unterstützen", "description": "Mit deinem Geldbeutel für bessere Praxis stimmen." } },
  "MEDIUM_ambiente_28": { "es": { "title": "Reduce desperdicio de alimentos", "description": "Planifica, porciona y almacena bien." }, "en": { "title": "Reduce food waste", "description": "Plan, portion, and store properly." }, "de": { "title": "Lebensmittelverschwendung reduzieren", "description": "Planen, portionieren und richtig lagern." } },
  "MEDIUM_ambiente_29": { "es": { "title": "Envases reutilizables", "description": "Lleva tus propios recipientes para comida." }, "en": { "title": "Reusable food containers", "description": "Bring your own food boxes." }, "de": { "title": "Wiederverwendbare Behälter", "description": "Eigene Essensdosen mitnehmen." } },
  "EASY_ambiente_30": { "es": { "title": "Educa a otros", "description": "Comparte un tip ambiental que aprendiste." }, "en": { "title": "Educate others", "description": "Share one eco tip you learned." }, "de": { "title": "Andere informieren", "description": "Teile einen Umwelt-Tipp, den du gelernt hast." } },
 "EASY_ambiente_31": { "es": { "title": "Cierra el grifo al enjabonarte", "description": "Mientras te lavas las manos, cierra el grifo para ahorrar agua." }, "en": { "title": "Turn off the tap while soaping", "description": "While washing your hands, turn off the tap to save water." }, "de": { "title": "Wasserhahn beim Einseifen zudrehen", "description": "Beim Händewaschen den Hahn schließen, um Wasser zu sparen." } },
  "EASY_ambiente_32": { "es": { "title": "Reutiliza agua de cocción", "description": "Deja enfriar y úsala para regar plantas (si no tiene sal)." }, "en": { "title": "Reuse cooking water", "description": "Let it cool and water plants with it (if unsalted)." }, "de": { "title": "Kochwasser wiederverwenden", "description": "Abkühlen lassen und (ungesalzen) zum Gießen nutzen." } },
  "EASY_ambiente_33": { "es": { "title": "Lleva envase reutilizable", "description": "Usa tu táper para take-away y evita envases desechables." }, "en": { "title": "Bring a reusable container", "description": "Use your own lunchbox for take-away and skip disposables." }, "de": { "title": "Wiederverwendbare Dose mitnehmen", "description": "Eigene Box für Take-away nutzen und Einweg vermeiden." } },
  "EASY_ambiente_34": { "es": { "title": "Cepíllate con vaso", "description": "Usa un vaso y no dejes correr el agua al cepillarte." }, "en": { "title": "Brush with a cup", "description": "Use a cup and don’t let water run while brushing." }, "de": { "title": "Mit Becher Zähne putzen", "description": "Becher nutzen und beim Putzen kein Wasser laufen lassen." } },
  "EASY_ambiente_35": { "es": { "title": "Activa modo eco", "description": "Configura el modo ecológico en tus electrodomésticos." }, "en": { "title": "Enable eco mode", "description": "Set appliances to their energy-saving mode." }, "de": { "title": "Eco-Modus aktivieren", "description": "Geräte auf den energiesparenden Modus stellen." } },
  "EASY_ambiente_36": { "es": { "title": "Documentos digitales", "description": "Comparte y firma en digital para evitar impresiones." }, "en": { "title": "Go paperless", "description": "Share and sign documents digitally to avoid printing." }, "de": { "title": "Papierlos arbeiten", "description": "Dokumente digital teilen und unterschreiben statt drucken." } },
  "EASY_ambiente_37": { "es": { "title": "Ajusta la nevera", "description": "Frigorífico a 4 °C y congelador a −18 °C para eficiencia." }, "en": { "title": "Set fridge temperatures", "description": "Fridge at 4 °C and freezer at −18 °C for efficiency." }, "de": { "title": "Kühlschrank richtig einstellen", "description": "Kühlschrank 4 °C, Gefrierschrank −18 °C für Effizienz." } },
  "EASY_ambiente_38": { "es": { "title": "Rechaza folletos", "description": "Di no a publicidad impresa que no necesites." }, "en": { "title": "Decline flyers", "description": "Say no to printed ads you don’t need." }, "de": { "title": "Flyer ablehnen", "description": "Unerwünschte Papierwerbung nicht annehmen." } },
  "EASY_ambiente_39": { "es": { "title": "Usa un buscador ecológico", "description": "Prueba un motor de búsqueda que apoye proyectos verdes." }, "en": { "title": "Use an eco search engine", "description": "Try a search engine that funds green projects." }, "de": { "title": "Öko-Suchmaschine nutzen", "description": "Suchmaschine wählen, die Umweltprojekte unterstützt." } },
  "EASY_ambiente_40": { "es": { "title": "Apaga el router por la noche", "description": "Si no lo necesitas, apágalo para ahorrar energía." }, "en": { "title": "Switch off router at night", "description": "Turn it off when unused to save energy." }, "de": { "title": "Router nachts ausschalten", "description": "Bei Nichtnutzung ausschalten, um Energie zu sparen." } },
  "EASY_ambiente_41": { "es": { "title": "Cocina con tapa", "description": "Tapar ollas ahorra tiempo y energía." }, "en": { "title": "Cook with lids on", "description": "Lids reduce cooking time and save energy." }, "de": { "title": "Mit Deckel kochen", "description": "Mit Deckel kochen spart Zeit und Energie." } },
  "EASY_ambiente_42": { "es": { "title": "Descongela en la nevera", "description": "Pasa alimentos del congelador a la nevera para aprovechar el frío." }, "en": { "title": "Defrost in the fridge", "description": "Move frozen food to the fridge to use the coolth." }, "de": { "title": "Im Kühlschrank auftauen", "description": "Gefrorenes im Kühlschrank auftauen und Kälte nutzen." } },
  "EASY_ambiente_43": { "es": { "title": "Agrupa recados", "description": "Haz varias tareas en un solo trayecto para evitar viajes extra." }, "en": { "title": "Batch your errands", "description": "Combine errands into one trip to avoid extra travel." }, "de": { "title": "Erledigungen bündeln", "description": "Mehrere Wege in einem Gang erledigen und Fahrten sparen." } },
  "EASY_ambiente_44": { "es": { "title": "Compra fruta y verdura “fea”", "description": "Elige piezas imperfectas para reducir el desperdicio." }, "en": { "title": "Buy “ugly” produce", "description": "Pick imperfect items to cut food waste." }, "de": { "title": "„Ugly“ Obst & Gemüse kaufen", "description": "Unperfekte Ware wählen, um Lebensmittelverschwendung zu senken." } },
  "EASY_ambiente_45": { "es": { "title": "Escoba antes que aspiradora", "description": "Para limpiezas pequeñas, usa escoba y recoge migas." }, "en": { "title": "Broom over vacuum", "description": "For small cleanups, use a broom instead of vacuum." }, "de": { "title": "Besen statt Staubsauger", "description": "Für kleine Reinigungen den Besen nutzen." } },
  "EASY_ambiente_46": { "es": { "title": "Aísla con cortinas", "description": "Cierra cortinas o persianas al atardecer para conservar calor." }, "en": { "title": "Insulate with curtains", "description": "Close curtains/blinds at dusk to keep heat in." }, "de": { "title": "Mit Vorhängen dämmen", "description": "Abends Vorhänge/Rollos schließen, um Wärme zu halten." } },
  "EASY_ambiente_47": { "es": { "title": "Usa regleta con interruptor", "description": "Apaga de una vez TV, consola y periféricos." }, "en": { "title": "Use a switched power strip", "description": "Cut standby for TV, console and peripherals at once." }, "de": { "title": "Steckdosenleiste mit Schalter", "description": "TV, Konsole & Co. gesammelt per Schalter ausschalten." } },
  "EASY_ambiente_48": { "es": { "title": "Aprovecha el horno", "description": "Hornea varias preparaciones a la vez para ahorrar energía." }, "en": { "title": "Make the oven count", "description": "Bake multiple dishes at once to save energy." }, "de": { "title": "Ofen optimal nutzen", "description": "Mehrere Speisen gleichzeitig backen und Energie sparen." } },
  "EASY_ambiente_49": { "es": { "title": "Cubiertos reutilizables", "description": "Lleva cubiertos de metal/bambú en tu bolso o mochila." }, "en": { "title": "Reusable cutlery", "description": "Carry metal/bamboo cutlery in your bag." }, "de": { "title": "Wiederverwendbares Besteck", "description": "Metall-/Bambus-Besteck in der Tasche mitnehmen." } },
  "EASY_ambiente_50": { "es": { "title": "Pide sin tapa ni agitador", "description": "En bebidas para llevar, evita tapas y paletinas." }, "en": { "title": "Ask for no lid or stirrer", "description": "Skip lids and stirrers on to-go drinks." }, "de": { "title": "Ohne Deckel und Rührstäbchen", "description": "Bei To-go-Getränken auf Deckel und Stäbchen verzichten." } },
  "EASY_ambiente_51": { "es": { "title": "Cámbiate a factura electrónica", "description": "Activa facturas digitales en tus servicios." }, "en": { "title": "Switch to e-billing", "description": "Enable digital invoices for your services." }, "de": { "title": "Auf E-Rechnung umstellen", "description": "Digitale Rechnungen bei deinen Anbietern aktivieren." } },
  "EASY_ambiente_52": { "es": { "title": "Apaga el motor en esperas", "description": "Si conduces, apágalo si vas a parar más de 1 minuto." }, "en": { "title": "Engine off while waiting", "description": "If driving, switch off when stationary over 1 minute." }, "de": { "title": "Motor im Stand aus", "description": "Beim Warten über 1 Minute den Motor ausschalten." } },
  "EASY_ambiente_53": { "es": { "title": "Airea la ropa", "description": "Si no está sucia, ventila y retrasa el lavado." }, "en": { "title": "Air clothes out", "description": "If not dirty, air garments instead of washing." }, "de": { "title": "Kleidung auslüften", "description": "Nicht stark verschmutzte Kleidung lüften statt waschen." } },
  "EASY_ambiente_54": { "es": { "title": "Bote para orgánicos", "description": "Prepara un recipiente para restos orgánicos (futuro compost)." }, "en": { "title": "Jar for organics", "description": "Set up a container for organic scraps (future compost)." }, "de": { "title": "Behälter für Bioabfälle", "description": "Einen Behälter für organische Reste bereitstellen (Kompost)." } },
  "EASY_ambiente_55": { "es": { "title": "Tarros para comprar a granel", "description": "Lleva frascos o bolsas de tela para rellenar." }, "en": { "title": "Bring jars for bulk", "description": "Take jars or cloth bags to refill." }, "de": { "title": "Gläser für Unverpackt", "description": "Gläser oder Stoffbeutel zum Auffüllen mitnehmen." } },
  "EASY_ambiente_56": { "es": { "title": "Reutiliza cajas de envío", "description": "Guarda cajas y rellenos para futuros envíos." }, "en": { "title": "Reuse shipping boxes", "description": "Keep boxes and packing for future shipments." }, "de": { "title": "Versandkartons wiederverwenden", "description": "Kartons und Füllmaterial für spätere Sendungen aufbewahren." } },
  "EASY_ambiente_57": { "es": { "title": "Imprime a doble cara", "description": "Activa doble cara y modo borrador si necesitas imprimir." }, "en": { "title": "Print double-sided", "description": "Use duplex and draft mode when printing." }, "de": { "title": "Beidseitig drucken", "description": "Beim Drucken Duplex und Entwurfsmodus nutzen." } },
  "EASY_ambiente_58": { "es": { "title": "Papelera de reciclaje visible", "description": "Coloca un contenedor de reciclaje a mano en casa." }, "en": { "title": "Visible recycling bin", "description": "Place a recycling bin somewhere obvious at home." }, "de": { "title": "Sichtbare Recyclingtonne", "description": "Eine gut sichtbare Recyclingtonne zu Hause platzieren." } },
  "EASY_ambiente_59": { "es": { "title": "Compra de temporada", "description": "Elige frutas y verduras de estación para reducir huella." }, "en": { "title": "Buy seasonal produce", "description": "Pick in-season fruit and veg to cut footprint." }, "de": { "title": "Saisonal einkaufen", "description": "Obst und Gemüse der Saison wählen, um die Bilanz zu verbessern." } },
  "EASY_ambiente_60": { "es": { "title": "Limpia filtros", "description": "Limpia filtros de campana o aire para mejorar eficiencia." }, "en": { "title": "Clean filters", "description": "Clean range hood or air filters to improve efficiency." }, "de": { "title": "Filter reinigen", "description": "Filter von Dunstabzug/Belüftung reinigen für bessere Effizienz." } },

  // Reducir uso de pantallas 
  "EASY_pantallas_1": { "es": { "title": "No mires el móvil al despertar", "description": "Espera al menos 30 minutos." }, "en": { "title": "Don’t check phone on waking", "description": "Wait at least 30 minutes." }, "de": { "title": "Nach dem Aufwachen nicht aufs Handy", "description": "Mindestens 30 Minuten warten." } },
  "MEDIUM_pantallas_2": { "es": { "title": "Zonas sin celular", "description": "Define comedor o dormitorio como libres de móvil." }, "en": { "title": "Phone-free zones", "description": "Make dining room or bedroom phone-free." }, "de": { "title": "Handyfreie Zonen", "description": "Esszimmer oder Schlafzimmer handyfrei machen." } },
  "EASY_pantallas_3": { "es": { "title": "Desactiva notificaciones", "description": "Quita las no esenciales para menos interrupciones." }, "en": { "title": "Disable non-essential alerts", "description": "Reduce constant interruptions." }, "de": { "title": "Nicht nötige Benachrichtigungen aus", "description": "Ständige Unterbrechungen reduzieren." } },
  "MEDIUM_pantallas_4": { "es": { "title": "Lee 30 min en papel", "description": "Reemplaza lectura en pantalla por libro físico." }, "en": { "title": "Read 30 min on paper", "description": "Swap screen reading for a physical book." }, "de": { "title": "30 Min. analog lesen", "description": "Bildschirmlektüre durch ein Buch ersetzen." } },
  "MEDIUM_pantallas_5": { "es": { "title": "Sal 1 hora sin móvil", "description": "Reconecta con el mundo real." }, "en": { "title": "Go out 1 hour phone-free", "description": "Reconnect with the real world." }, "de": { "title": "1 Stunde ohne Handy rausgehen", "description": "Wieder mit der realen Welt verbinden." } },
  "MEDIUM_pantallas_6": { "es": { "title": "Usa despertador clásico", "description": "Deja el móvil fuera del dormitorio." }, "en": { "title": "Use a classic alarm clock", "description": "Keep your phone out of the bedroom." }, "de": { "title": "Klassischen Wecker nutzen", "description": "Handy aus dem Schlafzimmer verbannen." } },
  "EASY_pantallas_7": { "es": { "title": "Actividad offline", "description": "Dedica tiempo a un hobby sin tecnología." }, "en": { "title": "Offline activity", "description": "Spend time on a no-tech hobby." }, "de": { "title": "Offline-Aktivität", "description": "Zeit für ein Hobby ohne Technik." } },
  "MEDIUM_pantallas_8": { "es": { "title": "Charla cara a cara", "description": "Sustituye mensajes por conversación real." }, "en": { "title": "Face-to-face chat", "description": "Replace texts with a real conversation." }, "de": { "title": "Persönliches Gespräch", "description": "Nachrichten durch echtes Reden ersetzen." } },
  "MEDIUM_pantallas_9": { "es": { "title": "Fija un «sunset digital»", "description": "Sin pantallas después de cierta hora." }, "en": { "title": "Set a digital sunset", "description": "No screens after a chosen time." }, "de": { "title": "Digitalen Feierabend festlegen", "description": "Nach einer bestimmten Uhrzeit keine Bildschirme." } },
  "MEDIUM_pantallas_10": { "es": { "title": "Elimina apps «roba-tiempo»", "description": "Identifícalas y bórralas hoy." }, "en": { "title": "Remove time-wasting apps", "description": "Identify and delete them today." }, "de": { "title": "Zeitfresser-Apps löschen", "description": "Heute identifizieren und entfernen." } },
  "EASY_pantallas_11": { "es": { "title": "Modo escala de grises", "description": "Haz tu móvil menos atractivo visualmente." }, "en": { "title": "Grayscale mode", "description": "Make your phone visually less tempting." }, "de": { "title": "Graustufenmodus", "description": "Handy optisch weniger verlockend machen." } },
  "EASY_pantallas_12": { "es": { "title": "Come sin pantallas", "description": "Practica alimentación consciente." }, "en": { "title": "Eat without screens", "description": "Practice mindful eating." }, "de": { "title": "Ohne Bildschirm essen", "description": "Achtsames Essen üben." } },
  "EASY_pantallas_13": { "es": { "title": "Temporizador para redes", "description": "Limita tu tiempo diario en apps." }, "en": { "title": "Social timer", "description": "Limit your daily time on apps." }, "de": { "title": "Timer für soziale Apps", "description": "Tägliche App-Zeit begrenzen." } },
  "EASY_pantallas_14": { "es": { "title": "Ejercicio sin audio", "description": "Haz deporte sin música ni podcast." }, "en": { "title": "Exercise without audio", "description": "Work out without music or podcasts." }, "de": { "title": "Training ohne Audio", "description": "Sport ohne Musik oder Podcast." } },
  "EASY_pantallas_15": { "es": { "title": "Diario en papel", "description": "Escribe a mano en vez de notas digitales." }, "en": { "title": "Paper journal", "description": "Write by hand instead of digital notes." }, "de": { "title": "Tagebuch auf Papier", "description": "Handschriftlich statt digital notieren." } },
  "HARD_pantallas_16": { "es": { "title": "Día familiar sin pantallas", "description": "Organiza tiempo de calidad juntos." }, "en": { "title": "Family screen-free day", "description": "Plan quality time together." }, "de": { "title": "Familientag ohne Bildschirme", "description": "Gemeinsame Qualitätszeit planen." } },
  "HARD_pantallas_17": { "es": { "title": "Navega sin GPS", "description": "Usa mapas físicos o pregunta direcciones." }, "en": { "title": "Navigate without GPS", "description": "Use paper maps or ask for directions." }, "de": { "title": "Ohne GPS navigieren", "description": "Papierkarten nutzen oder nach dem Weg fragen." } },
  "EASY_pantallas_18": { "es": { "title": "Observa la naturaleza", "description": "20 minutos sin fotos ni grabaciones." }, "en": { "title": "Observe nature", "description": "20 minutes without photos or recording." }, "de": { "title": "Natur beobachten", "description": "20 Minuten ohne Fotos oder Aufnahmen." } },
  "MEDIUM_pantallas_19": { "es": { "title": "Juegos de mesa", "description": "Alternativa a los videojuegos." }, "en": { "title": "Board games", "description": "Choose them instead of video games." }, "de": { "title": "Brettspiele", "description": "Statt Videospielen wählen." } },
  "HARD_pantallas_20": { "es": { "title": "Practica un instrumento", "description": "Actividad creativa sin pantallas." }, "en": { "title": "Practice an instrument", "description": "A creative, screen-free activity." }, "de": { "title": "Ein Instrument üben", "description": "Kreative Aktivität ohne Bildschirm." } },
  "MEDIUM_pantallas_21": { "es": { "title": "Cocina sin video", "description": "Prepara una receta nueva sin tutoriales." }, "en": { "title": "Cook without video", "description": "Make a new recipe without tutorials." }, "de": { "title": "Kochen ohne Video", "description": "Neues Rezept ohne Tutorial zubereiten." } },
  "EASY_pantallas_22": { "es": { "title": "Lista de tareas en papel", "description": "Usa papel en vez de apps de productividad." }, "en": { "title": "Paper to-do list", "description": "Use paper instead of productivity apps." }, "de": { "title": "To-do-Liste auf Papier", "description": "Papier statt Produktivitäts-Apps nutzen." } },
  "EASY_pantallas_23": { "es": { "title": "Medita sin apps", "description": "Solo silencio o sonidos naturales." }, "en": { "title": "Meditate without apps", "description": "Use silence or natural sounds only." }, "de": { "title": "Meditieren ohne Apps", "description": "Nur Stille oder natürliche Geräusche." } },
  "MEDIUM_pantallas_24": { "es": { "title": "Desinstala redes por un día", "description": "Observa cómo te sientes sin ellas." }, "en": { "title": "Uninstall socials for a day", "description": "Notice how you feel without them." }, "de": { "title": "Soziale Apps für einen Tag löschen", "description": "Achte darauf, wie du dich ohne sie fühlst." } },
  "EASY_pantallas_25": { "es": { "title": "Escucha música sin video", "description": "Disfruta solo el audio." }, "en": { "title": "Music without video", "description": "Enjoy audio only." }, "de": { "title": "Musik ohne Video", "description": "Nur den Ton genießen." } },
  "MEDIUM_pantallas_26": { "es": { "title": "Haz jardinería", "description": "Conecta con la tierra y desconecta de pantallas." }, "en": { "title": "Do some gardening", "description": "Connect to the earth and disconnect from screens." }, "de": { "title": "Gärtnern", "description": "Mit der Erde verbinden und Bildschirme meiden." } },
  "MEDIUM_pantallas_27": { "es": { "title": "Visita a alguien", "description": "Prefiere ver a la persona en vez de videollamar." }, "en": { "title": "Visit someone in person", "description": "Choose in-person instead of video call." }, "de": { "title": "Jemanden persönlich besuchen", "description": "Persönlich statt Videocall wählen." } },
  "MEDIUM_pantallas_28": { "es": { "title": "Fotografía analógica/mental", "description": "Prueba analógico o solo mira sin capturar." }, "en": { "title": "Analog/mental photography", "description": "Try analog or just observe without capturing." }, "de": { "title": "Analoge/mentale Fotografie", "description": "Analog probieren oder nur beobachten ohne aufzunehmen." } },
  "EASY_pantallas_29": { "es": { "title": "Manualidades", "description": "Crea algo con tus manos sin tecnología." }, "en": { "title": "Crafts", "description": "Make something with your hands—no tech." }, "de": { "title": "Basteln/Handarbeit", "description": "Etwas mit den Händen schaffen – ohne Technik." } },
  "EASY_pantallas_30": { "es": { "title": "Revisa tu tiempo de pantalla", "description": "Mira estadísticas y toma conciencia." }, "en": { "title": "Check screen-time stats", "description": "Review usage and build awareness." }, "de": { "title": "Bildschirmzeit prüfen", "description": "Nutzung ansehen und Bewusstsein schaffen." } },

  "EASY_pantallas_31": {
    "es": { "title": "Configura límites diarios de apps", "description": "Activa “Tiempo de uso/Wellbeing” y fija minutos por app." },
    "en": { "title": "Set daily app limits", "description": "Enable Screen Time/Digital Wellbeing and set minutes per app." },
    "de": { "title": "Tägliche App-Limits einstellen", "description": "Bildschirmzeit/Digital Wellbeing aktivieren und Minuten pro App festlegen." }
  },
  "EASY_pantallas_32": {
    "es": { "title": "Mueve apps tentación al final", "description": "Coloca redes y juegos en la última pantalla de inicio." },
    "en": { "title": "Move tempting apps to the end", "description": "Place socials and games on the last home screen page." },
    "de": { "title": "Verlockende Apps nach hinten", "description": "Soziale Medien und Spiele auf die letzte Startseite verschieben." }
  },
  "EASY_pantallas_33": {
    "es": { "title": "Oculta widgets y noticias", "description": "Quita widgets que te hacen abrir el móvil sin pensar." },
    "en": { "title": "Hide widgets and news feeds", "description": "Remove widgets that trigger mindless phone checks." },
    "de": { "title": "Widgets und News ausblenden", "description": "Widgets entfernen, die zu gedankenlosem Öffnen verleiten." }
  },
  "EASY_pantallas_34": {
    "es": { "title": "Caja de “parking” para el móvil", "description": "Déjalo 60 minutos en una caja o cesto lejos de ti." },
    "en": { "title": "Phone parking box", "description": "Leave it in a box/basket away from you for 60 minutes." },
    "de": { "title": "Handy-Parkbox", "description": "Lege es 60 Minuten lang außer Reichweite in eine Box/Korb." }
  },
  "EASY_pantallas_35": {
    "es": { "title": "Notificaciones en resumen", "description": "Agrupa avisos en horarios fijos con un resumen programado." },
    "en": { "title": "Notification summary", "description": "Batch notifications into fixed times with a scheduled summary." },
    "de": { "title": "Benachrichtigungs-Zusammenfassung", "description": "Mit geplantem Überblick Benachrichtigungen zu festen Zeiten bündeln." }
  },
  "EASY_pantallas_36": {
    "es": { "title": "Desactiva el autoplay", "description": "Apaga la reproducción automática en redes y vídeo." },
    "en": { "title": "Disable autoplay", "description": "Turn off auto-play in social apps and video platforms." },
    "de": { "title": "Autoplay deaktivieren", "description": "Autoplay in sozialen Apps und Video-Plattformen ausschalten." }
  },
  "EASY_pantallas_37": {
    "es": { "title": "Silencia chats no urgentes", "description": "Silencia grupos o DMs por 8 horas." },
    "en": { "title": "Mute non-urgent chats", "description": "Mute groups/DMs for 8 hours." },
    "de": { "title": "Nicht dringende Chats stummschalten", "description": "Gruppen/DMs für 8 Stunden stummschalten." }
  },
  "EASY_pantallas_38": {
    "es": { "title": "Darse de baja de newsletters", "description": "Cancela la suscripción de 3 correos que no lees." },
    "en": { "title": "Unsubscribe from newsletters", "description": "Unsubscribe from 3 emails you never read." },
    "de": { "title": "Newsletter abbestellen", "description": "Drei Newsletter abmelden, die du nie liest." }
  },
  "EASY_pantallas_39": {
    "es": { "title": "Programa “No molestar”", "description": "Actívalo a una hora fija cada día." },
    "en": { "title": "Schedule Do Not Disturb", "description": "Enable it at a fixed time every day." },
    "de": { "title": "Nicht stören planen", "description": "Täglich zu einer festen Zeit aktivieren." }
  },
  "EASY_pantallas_40": {
    "es": { "title": "Consulta la hora en reloj", "description": "Mira la hora en reloj, no en el móvil, hoy." },
    "en": { "title": "Check time on a watch", "description": "Use a watch instead of your phone today." },
    "de": { "title": "Zeit auf der Uhr prüfen", "description": "Heute die Uhr statt des Handys benutzen." }
  },
  "EASY_pantallas_41": {
    "es": { "title": "Lee en papel 1 artículo", "description": "Imprime o usa papel para un artículo largo." },
    "en": { "title": "Read one article on paper", "description": "Print or use paper for a long-form piece." },
    "de": { "title": "Einen Artikel auf Papier lesen", "description": "Einen längeren Text ausdrucken oder auf Papier lesen." }
  },
  "EASY_pantallas_42": {
    "es": { "title": "Fuera del baño", "description": "No lleves el móvil al baño hoy." },
    "en": { "title": "No phone in the bathroom", "description": "Keep your phone out of the bathroom today." },
    "de": { "title": "Kein Handy im Bad", "description": "Heute das Handy nicht mit ins Bad nehmen." }
  },
  "EASY_pantallas_43": {
    "es": { "title": "Solo audio en YouTube", "description": "Escucha 20 min sin mirar la pantalla." },
    "en": { "title": "Audio-only YouTube", "description": "Listen for 20 minutes without watching the screen." },
    "de": { "title": "YouTube nur als Audio", "description": "20 Minuten hören, ohne auf den Bildschirm zu schauen." }
  },
  "EASY_pantallas_44": {
    "es": { "title": "Quita previsualizaciones", "description": "Desactiva previews de video/animación en apps." },
    "en": { "title": "Remove previews", "description": "Disable video/animation previews in apps." },
    "de": { "title": "Vorschauen entfernen", "description": "Video-/Animationsvorschauen in Apps deaktivieren." }
  },
  "EASY_pantallas_45": {
    "es": { "title": "Sin push en correo", "description": "Apaga el push del email y revisa manualmente." },
    "en": { "title": "No email push", "description": "Turn off email push; check manually." },
    "de": { "title": "Kein E-Mail-Push", "description": "E-Mail-Push ausschalten und manuell prüfen." }
  },
  "EASY_pantallas_46": {
    "es": { "title": "3 momentos para mensajes", "description": "Elige 3 horarios para revisar mensajes hoy." },
    "en": { "title": "Three message check-ins", "description": "Pick three times to check messages today." },
    "de": { "title": "Dreimal Nachrichten prüfen", "description": "Heute drei feste Zeiten zum Nachrichtenchecken wählen." }
  },
  "EASY_pantallas_47": {
    "es": { "title": "Lista de compras en papel", "description": "Usa papel en vez de app para tu lista." },
    "en": { "title": "Shopping list on paper", "description": "Use paper instead of an app for your list." },
    "de": { "title": "Einkaufsliste auf Papier", "description": "Statt App eine Papierliste verwenden." }
  },
  "EASY_pantallas_48": {
    "es": { "title": "Modo avión 30 minutos", "description": "Bloque de concentración sin interrupciones." },
    "en": { "title": "Airplane mode for 30 minutes", "description": "Focus block with zero interruptions." },
    "de": { "title": "30 Minuten Flugmodus", "description": "Konzentriert arbeiten ohne Unterbrechungen." }
  },
  "EASY_pantallas_49": {
    "es": { "title": "Una sola página de inicio", "description": "Reduce a una pantalla con solo esenciales." },
    "en": { "title": "Single home-screen page", "description": "Keep only essentials on one page." },
    "de": { "title": "Nur eine Startseite", "description": "Auf eine Seite mit nur den wichtigsten Apps reduzieren." }
  },
  "EASY_pantallas_50": {
    "es": { "title": "Tema minimalista", "description": "Fondo simple, sin animaciones, todo el día." },
    "en": { "title": "Minimal theme", "description": "Simple wallpaper, no animations, all day." },
    "de": { "title": "Minimalistisches Theme", "description": "Schlichter Hintergrund, keine Animationen – den ganzen Tag." }
  },
  "EASY_pantallas_51": {
    "es": { "title": "Regla 20-20-20", "description": "Cada 20 min, mira 20 s a 6 m de distancia." },
    "en": { "title": "20-20-20 rule", "description": "Every 20 min, look 20 s at 20 ft (6 m) away." },
    "de": { "title": "20-20-20-Regel", "description": "Alle 20 Min. 20 Sek. in 6 m Entfernung schauen." }
  },
  "EASY_pantallas_52": {
    "es": { "title": "Cargador lejos de la cama", "description": "Evita usar el móvil en la noche." },
    "en": { "title": "Charger away from bed", "description": "Avoid nighttime phone use." },
    "de": { "title": "Ladegerät weg vom Bett", "description": "Nächtliche Handynutzung vermeiden." }
  },
  "EASY_pantallas_53": {
    "es": { "title": "Limpieza de apps", "description": "Elimina 5 apps que no usas." },
    "en": { "title": "App cleanup", "description": "Delete five apps you don’t use." },
    "de": { "title": "App-Aufräumen", "description": "Fünf nicht genutzte Apps löschen." }
  },
  "EASY_pantallas_54": {
    "es": { "title": "Desinstala un juego adictivo", "description": "Elimina hoy el juego que más tiempo te roba." },
    "en": { "title": "Uninstall one addictive game", "description": "Remove the game that eats most of your time." },
    "de": { "title": "Ein süchtig machendes Spiel löschen", "description": "Das zeitfressendste Spiel heute entfernen." }
  },
  "EASY_pantallas_55": {
    "es": { "title": "Sin alertas de última hora", "description": "Desactiva breaking news no esenciales." },
    "en": { "title": "No breaking-news alerts", "description": "Turn off non-essential breaking news." },
    "de": { "title": "Keine Eilmeldungen", "description": "Nicht essenzielle Breaking-News deaktivieren." }
  },
  "EASY_pantallas_56": {
    "es": { "title": "Cambia scroll por paseo", "description": "Reemplaza 15 min de scroll por caminar 15 min." },
    "en": { "title": "Swap scrolling for a walk", "description": "Replace 15 min of scrolling with a 15-min walk." },
    "de": { "title": "Scrollen gegen Spaziergang tauschen", "description": "15 Min. Scrollen durch 15 Min. Gehen ersetzen." }
  },
  "EASY_pantallas_57": {
    "es": { "title": "Filtra palabras clave", "description": "Bloquea términos que disparan tu doomscrolling." },
    "en": { "title": "Filter trigger keywords", "description": "Block terms that fuel your doomscrolling." },
    "de": { "title": "Trigger-Schlagwörter filtern", "description": "Begriffe blockieren, die Doomscrolling auslösen." }
  },
  "EASY_pantallas_58": {
    "es": { "title": "Sin vibración háptica", "description": "Desactiva la vibración del teclado y toques." },
    "en": { "title": "No haptic buzz", "description": "Disable keyboard and touch vibration." },
    "de": { "title": "Keine haptische Vibration", "description": "Vibration für Tastatur und Taps ausschalten." }
  },
  "EASY_pantallas_59": {
    "es": { "title": "Fondo “respira”", "description": "Pon un recordatorio minimalista para pausar." },
    "en": { "title": "“Breathe” wallpaper", "description": "Set a minimalist reminder to pause." },
    "de": { "title": "„Atmen“-Hintergrund", "description": "Minimalistische Erinnerung zum Innehalten setzen." }
  },
  "EASY_pantallas_60": {
    "es": { "title": "Zona de carga fuera del dormitorio", "description": "Crea un punto de carga lejos de la cama." },
    "en": { "title": "Charging zone outside bedroom", "description": "Create a charging spot away from your bed." },
    "de": { "title": "Ladezone außerhalb des Schlafzimmers", "description": "Einen Ladeplatz fern vom Bett einrichten." }
  },


  // Comer Sano 
  "EASY_comer_1": { "es": { "title": "5 porciones de frutas y verduras", "description": "Reparte 5 porciones con lo que tengas." }, "en": { "title": "5 servings fruit & veg", "description": "Spread 5 servings through the day." }, "de": { "title": "5 Portionen Obst & Gemüse", "description": "5 Portionen über den Tag verteilen." } },
"EASY_comer_2": { "es": { "title": "8 vasos de agua", "description": "Usa una botella y marca 8 tomas." }, "en": { "title": "8 glasses of water", "description": "Use a bottle and tick off 8 drinks." }, "de": { "title": "8 Gläser Wasser", "description": "Flasche nutzen und 8 Trinkeinheiten markieren." } },
"EASY_comer_3": { "es": { "title": "Sin bebidas azucaradas", "description": "Elige agua o infusiones." }, "en": { "title": "No sugary drinks", "description": "Choose water or tea." }, "de": { "title": "Keine zuckrigen Getränke", "description": "Wasser oder Tee wählen." } },
"MEDIUM_comer_4": { "es": { "title": "Proteína en cada comida", "description": "Huevo, yogur, legumbres o pollo." }, "en": { "title": "Protein every meal", "description": "Eggs, yogurt, legumes, or chicken." }, "de": { "title": "Protein zu jeder Mahlzeit", "description": "Ei, Joghurt, Hülsenfrüchte oder Huhn." } },
"MEDIUM_comer_5": { "es": { "title": "Menos azúcar añadido", "description": "Revisa 2–3 etiquetas y elige mejor." }, "en": { "title": "Cut added sugar", "description": "Check 2–3 labels and pick lower sugar." }, "de": { "title": "Weniger zugesetzten Zucker", "description": "2–3 Etiketten prüfen und besser wählen." } },
"MEDIUM_comer_6": { "es": { "title": "Receta saludable nueva", "description": "Prueba algo simple al horno/plancha." }, "en": { "title": "New healthy recipe", "description": "Try something simple baked or grilled." }, "de": { "title": "Neues gesundes Rezept", "description": "Einfaches Ofen- oder Pfannengericht probieren." } },
"EASY_comer_7": { "es": { "title": "Come más despacio", "description": "Deja el cubierto y mastica 10–15 veces." }, "en": { "title": "Eat more slowly", "description": "Put down cutlery; chew 10–15 times." }, "de": { "title": "Langsamer essen", "description": "Besteck ablegen; 10–15 Mal kauen." } },
"MEDIUM_comer_8": { "es": { "title": "Prepárate 1–2 tuppers", "description": "Deja comida lista para mañana." }, "en": { "title": "Meal prep 1–2 boxes", "description": "Prepare food for tomorrow." }, "de": { "title": "1–2 Boxen vorkochen", "description": "Essen für morgen vorbereiten." } },
"EASY_comer_9": { "es": { "title": "Grasas saludables", "description": "Aguacate, frutos secos u oliva." }, "en": { "title": "Healthy fats", "description": "Avocado, nuts, or olive oil." }, "de": { "title": "Gesunde Fette", "description": "Avocado, Nüsse oder Olivenöl." } },
"MEDIUM_comer_10": { "es": { "title": "Evita procesados hoy", "description": "Elige fresco o con pocos ingredientes." }, "en": { "title": "Skip processed foods", "description": "Choose fresh or few-ingredient options." }, "de": { "title": "Heute ohne Fertigprodukte", "description": "Frische oder wenige Zutaten wählen." } },
"MEDIUM_comer_11": { "es": { "title": "Pescado 2 veces/semana", "description": "Planifica 2 comidas con pescado." }, "en": { "title": "Fish twice a week", "description": "Plan 2 meals with fish." }, "de": { "title": "Zweimal pro Woche Fisch", "description": "2 Fischmahlzeiten einplanen." } },
"EASY_comer_12": { "es": { "title": "Snack fruta o frutos secos", "description": "Sustituye ultraprocesados." }, "en": { "title": "Fruit or nuts snack", "description": "Swap out ultra-processed snacks." }, "de": { "title": "Snack Obst oder Nüsse", "description": "Statt stark verarbeiteter Snacks." } },
"MEDIUM_comer_13": { "es": { "title": "Lee etiquetas", "description": "Compara azúcar, sal y fibra." }, "en": { "title": "Read labels", "description": "Compare sugar, salt, and fiber." }, "de": { "title": "Etiketten lesen", "description": "Zucker, Salz und Ballaststoffe vergleichen." } },
"EASY_comer_14": { "es": { "title": "Menos sal", "description": "Usa especias y prueba antes." }, "en": { "title": "Reduce salt", "description": "Use spices and taste first." }, "de": { "title": "Weniger Salz", "description": "Gewürze nutzen und erst probieren." } },
"EASY_comer_15": { "es": { "title": "Plato más pequeño", "description": "Controla porciones sin pensar." }, "en": { "title": "Smaller plate", "description": "Control portions effortlessly." }, "de": { "title": "Kleinerer Teller", "description": "Portionen ohne Aufwand steuern." } },
"EASY_comer_16": { "es": { "title": "No te saltes el desayuno", "description": "Incluye proteína y fruta." }, "en": { "title": "Don’t skip breakfast", "description": "Include protein and fruit." }, "de": { "title": "Frühstück nicht auslassen", "description": "Protein und Obst einbauen." } },
"MEDIUM_comer_17": { "es": { "title": "Granos integrales", "description": "Sustituye pan/arroz/pasta por integral." }, "en": { "title": "Whole grains", "description": "Swap bread/rice/pasta for whole-grain." }, "de": { "title": "Vollkorn", "description": "Brot/Reis/Nudeln durch Vollkorn ersetzen." } },
"EASY_comer_18": { "es": { "title": "Sin pantallas al comer", "description": "Come con atención plena." }, "en": { "title": "No screens while eating", "description": "Practice mindful eating." }, "de": { "title": "Ohne Bildschirm essen", "description": "Achtsam essen." } },
"MEDIUM_comer_19": { "es": { "title": "Proteína vegetal", "description": "Incluye legumbres o tofu." }, "en": { "title": "Plant protein", "description": "Add legumes or tofu." }, "de": { "title": "Pflanzliches Protein", "description": "Hülsenfrüchte oder Tofu einbauen." } },
"EASY_comer_20": { "es": { "title": "Smoothie verde", "description": "Hojas verdes + fruta + agua/leche." }, "en": { "title": "Green smoothie", "description": "Leafy greens + fruit + water/milk." }, "de": { "title": "Grüner Smoothie", "description": "Grünes Blattgemüse + Obst + Wasser/Milch." } },
"MEDIUM_comer_21": { "es": { "title": "3 colores de verduras", "description": "Añade al menos 3 colores al plato." }, "en": { "title": "3 veggie colors", "description": "Add at least 3 colors to your plate." }, "de": { "title": "3 Gemüsefarben", "description": "Mindestens 3 Farben auf dem Teller." } },
"MEDIUM_comer_22": { "es": { "title": "Ajusta carbohidratos", "description": "½ verduras, ¼ proteína, ¼ carbohidratos." }, "en": { "title": "Tweak carbs", "description": "½ veg, ¼ protein, ¼ carbs." }, "de": { "title": "Kohlenhydrate anpassen", "description": "½ Gemüse, ¼ Protein, ¼ Kohlenhydrate." } },
"EASY_comer_23": { "es": { "title": "Sin picoteo nocturno", "description": "Define la última hora de comer." }, "en": { "title": "No late-night snacking", "description": "Set a last eating time." }, "de": { "title": "Kein spätes Naschen", "description": "Letzte Essenszeit festlegen." } },
"MEDIUM_comer_24": { "es": { "title": "Aderezo casero", "description": "Aceite, limón y especias; sin azúcar." }, "en": { "title": "Homemade dressing", "description": "Oil, lemon, spices; no sugar." }, "de": { "title": "Hausgemachtes Dressing", "description": "Öl, Zitrone, Gewürze; ohne Zucker." } },
"EASY_comer_25": { "es": { "title": "Más fibra", "description": "Legumbres, fruta con piel o verduras." }, "en": { "title": "More fiber", "description": "Legumes, skin-on fruit, or veg." }, "de": { "title": "Mehr Ballaststoffe", "description": "Hülsenfrüchte, Obst mit Schale oder Gemüse." } },
"EASY_comer_26": { "es": { "title": "Fruta como postre", "description": "Termina con 1 pieza de fruta." }, "en": { "title": "Fruit for dessert", "description": "Finish with one piece of fruit." }, "de": { "title": "Obst zum Dessert", "description": "Mit einem Stück Obst abschließen." } },
"MEDIUM_comer_27": { "es": { "title": "Plan semanal", "description": "3–5 platos base y su lista." }, "en": { "title": "Weekly plan", "description": "List 3–5 base dishes and ingredients." }, "de": { "title": "Wochenplan", "description": "3–5 Grundgerichte und Zutaten notieren." } },
"MEDIUM_comer_28": { "es": { "title": "Sin frituras hoy", "description": "Usa horno, vapor, plancha o airfryer." }, "en": { "title": "No frying today", "description": "Use oven, steam, grill, or air fryer." }, "de": { "title": "Heute nicht frittieren", "description": "Ofen, Dampf, Grill oder Heißluftfritteuse nutzen." } },
"MEDIUM_comer_29": { "es": { "title": "Probióticos naturales", "description": "Yogur/kéfir o fermentados." }, "en": { "title": "Natural probiotics", "description": "Yogurt/kefir or fermented foods." }, "de": { "title": "Natürliche Probiotika", "description": "Joghurt/Kefir oder Fermentiertes." } },
"EASY_comer_30": { "es": { "title": "Escucha tu hambre", "description": "Come con hambre real y para con saciedad." }, "en": { "title": "Listen to hunger cues", "description": "Eat when truly hungry; stop comfortably full." }, "de": { "title": "Auf Hungersignale hören", "description": "Bei echtem Hunger essen; angenehm satt aufhören." } },

  "EASY_comer_31": {
    "es": { "title": "Añade 1 pieza de fruta extra", "description": "Suma hoy 1 fruta más a tu día." },
    "en": { "title": "Add one extra fruit", "description": "Add one more piece of fruit today." },
    "de": { "title": "Ein zusätzliches Stück Obst", "description": "Heute ein weiteres Stück Obst einplanen." }
  },
  "EASY_comer_32": {
    "es": { "title": "Un vaso de agua antes de cada comida", "description": "Bebe agua 10–20 min antes de comer." },
    "en": { "title": "One glass of water before meals", "description": "Drink water 10–20 minutes before eating." },
    "de": { "title": "Ein Glas Wasser vor jeder Mahlzeit", "description": "10–20 Minuten vor dem Essen Wasser trinken." }
  },
  "EASY_comer_33": {
    "es": { "title": "Merienda proteica simple", "description": "Yogur natural o un puñado de frutos secos." },
    "en": { "title": "Simple protein snack", "description": "Plain yogurt or a handful of nuts." },
    "de": { "title": "Einfacher Protein-Snack", "description": "Naturjoghurt oder eine Handvoll Nüsse." }
  },
  "EASY_comer_34": {
    "es": { "title": "Mitad del plato verduras", "description": "Que la mitad del plato sean verduras." },
    "en": { "title": "Half plate veggies", "description": "Make half your plate vegetables." },
    "de": { "title": "Halber Teller Gemüse", "description": "Die Hälfte des Tellers mit Gemüse füllen." }
  },
  "EASY_comer_35": {
    "es": { "title": "Evita salsas azucaradas", "description": "Usa limón, especias o aceite de oliva." },
    "en": { "title": "Skip sugary sauces", "description": "Use lemon, herbs, or olive oil instead." },
    "de": { "title": "Zuckerhaltige Soßen vermeiden", "description": "Lieber Zitrone, Gewürze oder Olivenöl verwenden." }
  },
  "EASY_comer_36": {
    "es": { "title": "Elige pan integral", "description": "Sustituye pan blanco por integral." },
    "en": { "title": "Choose whole-grain bread", "description": "Swap white bread for whole-grain." },
    "de": { "title": "Vollkornbrot wählen", "description": "Weißbrot durch Vollkornbrot ersetzen." }
  },
  "EASY_comer_37": {
    "es": { "title": "Incluye una ensalada", "description": "Añade una ensalada sencilla a tu comida." },
    "en": { "title": "Add a salad", "description": "Include a simple salad with your meal." },
    "de": { "title": "Einen Salat hinzufügen", "description": "Eine einfache Salatbeilage einplanen." }
  },
  "EASY_comer_38": {
    "es": { "title": "Control de porciones con plato pequeño", "description": "Usa plato más pequeño para servirte." },
    "en": { "title": "Portion control with smaller plate", "description": "Serve meals on a smaller plate." },
    "de": { "title": "Portionskontrolle mit kleinem Teller", "description": "Mahlzeiten auf einem kleineren Teller servieren." }
  },
  "EASY_comer_39": {
    "es": { "title": "Sin bebidas energéticas", "description": "Evítalas por hoy; elige agua o infusiones." },
    "en": { "title": "No energy drinks today", "description": "Choose water or herbal tea instead." },
    "de": { "title": "Heute keine Energydrinks", "description": "Stattdessen Wasser oder Kräutertee wählen." }
  },
  "EASY_comer_40": {
    "es": { "title": "Fruta de postre", "description": "Cierra la comida con fruta entera." },
    "en": { "title": "Fruit for dessert", "description": "Finish your meal with whole fruit." },
    "de": { "title": "Obst als Dessert", "description": "Die Mahlzeit mit frischem Obst beenden." }
  },
  "EASY_comer_41": {
    "es": { "title": "Añade legumbres", "description": "Incluye lentejas, garbanzos o alubias hoy." },
    "en": { "title": "Add legumes", "description": "Include lentils, chickpeas, or beans today." },
    "de": { "title": "Hülsenfrüchte hinzufügen", "description": "Heute Linsen, Kichererbsen oder Bohnen einbauen." }
  },
  "EASY_comer_42": {
    "es": { "title": "Reduce el pan en la cena", "description": "Prioriza verduras y proteína ligera." },
    "en": { "title": "Cut back bread at dinner", "description": "Prioritize vegetables and lean protein." },
    "de": { "title": "Abends weniger Brot", "description": "Gemüse und leichte Proteine bevorzugen." }
  },
  "EASY_comer_43": {
    "es": { "title": "Desayuno con fibra", "description": "Avena, fruta con piel o pan integral." },
    "en": { "title": "High-fiber breakfast", "description": "Oats, fruit with skin, or whole-grain bread." },
    "de": { "title": "Ballaststoffreiches Frühstück", "description": "Hafer, Obst mit Schale oder Vollkornbrot." }
  },
  "EASY_comer_44": {
    "es": { "title": "Sin embutidos hoy", "description": "Sustituye por pollo, pavo o legumbres." },
    "en": { "title": "No processed meats today", "description": "Swap for chicken, turkey, or legumes." },
    "de": { "title": "Heute keine Wurstwaren", "description": "Durch Huhn, Pute oder Hülsenfrüchte ersetzen." }
  },
  "EASY_comer_45": {
    "es": { "title": "Añade semillas", "description": "Chía, lino o sésamo a tus platos." },
    "en": { "title": "Add seeds", "description": "Top meals with chia, flax, or sesame." },
    "de": { "title": "Samen hinzufügen", "description": "Gerichte mit Chia, Leinsamen oder Sesam toppen." }
  },
  "EASY_comer_46": {
    "es": { "title": "Evita frituras", "description": "Cocina al horno, vapor o plancha." },
    "en": { "title": "Skip deep-fried foods", "description": "Bake, steam, or grill instead." },
    "de": { "title": "Frittieren vermeiden", "description": "Stattdessen backen, dämpfen oder grillen." }
  },
  "EASY_comer_47": {
    "es": { "title": "Mastica 15 veces por bocado", "description": "Come más lento y con atención." },
    "en": { "title": "Chew 15 times per bite", "description": "Eat slower and with attention." },
    "de": { "title": "15-mal kauen pro Bissen", "description": "Langsamer und achtsam essen." }
  },
  "EASY_comer_48": {
    "es": { "title": "Cena temprano", "description": "Termina de cenar al menos 3 h antes de dormir." },
    "en": { "title": "Early dinner", "description": "Finish eating at least 3 hours before bed." },
    "de": { "title": "Früh zu Abend essen", "description": "Mindestens 3 Stunden vor dem Schlafen fertig essen." }
  },
  "EASY_comer_49": {
    "es": { "title": "Incluye un alimento fermentado", "description": "Yogur, kéfir o chucrut en pequeña porción." },
    "en": { "title": "Include a fermented food", "description": "Yogurt, kefir, or sauerkraut in a small portion." },
    "de": { "title": "Ein fermentiertes Lebensmittel", "description": "Joghurt, Kefir oder Sauerkraut in kleiner Portion." }
  },
  "EASY_comer_50": {
    "es": { "title": "Prueba una verdura nueva", "description": "Elige una que no comas habitualmente." },
    "en": { "title": "Try a new vegetable", "description": "Pick one you don’t usually eat." },
    "de": { "title": "Neues Gemüse probieren", "description": "Ein Gemüse wählen, das du selten isst." }
  },
  "EASY_comer_51": {
    "es": { "title": "Evita bollería industrial", "description": "Cámbiala por fruta o frutos secos." },
    "en": { "title": "Skip packaged pastries", "description": "Choose fruit or nuts instead." },
    "de": { "title": "Keine Industriebäckerei-Backwaren", "description": "Stattdessen Obst oder Nüsse wählen." }
  },
  "EASY_comer_52": {
    "es": { "title": "Sopa o crema de verduras", "description": "Empieza la comida con una crema ligera." },
    "en": { "title": "Veggie soup starter", "description": "Start your meal with a light veggie soup." },
    "de": { "title": "Gemüsesuppe als Vorspeise", "description": "Die Mahlzeit mit einer leichten Suppe beginnen." }
  },
  "EASY_comer_53": {
    "es": { "title": "Aliño casero rápido", "description": "Aceite de oliva + limón/vinagre + especias." },
    "en": { "title": "Quick homemade dressing", "description": "Olive oil + lemon/vinegar + spices." },
    "de": { "title": "Schnelles hausgemachtes Dressing", "description": "Olivenöl + Zitrone/Essig + Gewürze." }
  },
  "EASY_comer_54": {
    "es": { "title": "Reduce azúcar en el café", "description": "Prueba con menos cantidad o sin azúcar." },
    "en": { "title": "Cut sugar in coffee", "description": "Use less sugar or go without." },
    "de": { "title": "Weniger Zucker im Kaffee", "description": "Weniger Zucker oder ganz ohne trinken." }
  },
  "EASY_comer_55": {
    "es": { "title": "Hidratación constante", "description": "Lleva contigo una botella de agua." },
    "en": { "title": "Stay hydrated", "description": "Carry a water bottle with you." },
    "de": { "title": "Ausreichend trinken", "description": "Eine Wasserflasche dabeihaben." }
  },
  "EASY_comer_56": {
    "es": { "title": "Snack de verdura", "description": "Palitos de zanahoria/pepino con hummus." },
    "en": { "title": "Veggie snack", "description": "Carrot/cucumber sticks with hummus." },
    "de": { "title": "Gemüse-Snack", "description": "Karotten-/Gurkensticks mit Hummus." }
  },
  "EASY_comer_57": {
    "es": { "title": "Porción de frutos secos", "description": "Un puñado (20–30 g) sin sal." },
    "en": { "title": "Nuts portion", "description": "One handful (20–30 g), unsalted." },
    "de": { "title": "Portion Nüsse", "description": "Eine Handvoll (20–30 g), ungesalzen." }
  },
  "EASY_comer_58": {
    "es": { "title": "Evita comer de pie", "description": "Siéntate a la mesa y come con calma." },
    "en": { "title": "Don’t eat standing up", "description": "Sit at a table and eat mindfully." },
    "de": { "title": "Nicht im Stehen essen", "description": "Am Tisch sitzen und in Ruhe essen." }
  },
  "EASY_comer_59": {
    "es": { "title": "2 colores extra en el plato", "description": "Añade dos colores de verdura/fruta más." },
    "en": { "title": "Two extra colors on the plate", "description": "Add two more fruit/veg colors." },
    "de": { "title": "Zwei zusätzliche Farben auf dem Teller", "description": "Zwei weitere Obst-/Gemüsefarben ergänzen." }
  },
  "EASY_comer_60": {
    "es": { "title": "Agua como bebida principal", "description": "Hoy, elige agua en todas tus comidas." },
    "en": { "title": "Water as main drink", "description": "Choose water with every meal today." },
    "de": { "title": "Wasser als Hauptgetränk", "description": "Heute zu jeder Mahlzeit Wasser wählen." }
  },


// Dormir Bien (dormir_1 a dormir_30)
"EASY_dormir_1": { "es": { "title": "Acuéstate a la misma hora", "description": "Elige una hora fija y respétala." }, "en": { "title": "Go to bed at the same time", "description": "Pick a fixed bedtime and stick to it." }, "de": { "title": "Zur selben Zeit schlafen gehen", "description": "Feste Schlafenszeit wählen und einhalten." } },
"EASY_dormir_2": { "es": { "title": "Sin pantallas 1 hora antes", "description": "Luz cálida o lectura ligera." }, "en": { "title": "No screens 1 hour before", "description": "Use warm light or light reading." }, "de": { "title": "1 Stunde ohne Bildschirm", "description": "Warmlicht oder leichte Lektüre." } },
"EASY_dormir_3": { "es": { "title": "Ducha tibia", "description": "Relaja cuerpo y mente antes de dormir." }, "en": { "title": "Warm shower", "description": "Relax body and mind before bed." }, "de": { "title": "Warme Dusche", "description": "Körper und Geist vor dem Schlafen entspannen." } },
"EASY_dormir_4": { "es": { "title": "Lee 10–15 minutos", "description": "Lectura calmada sin pantallas." }, "en": { "title": "Read 10–15 minutes", "description": "Calm reading without screens." }, "de": { "title": "10–15 Min. lesen", "description": "Ruhige Lektüre ohne Bildschirm." } },
"EASY_dormir_5": { "es": { "title": "Hab. fresca (18–20°C)", "description": "Ventila unos minutos si es posible." }, "en": { "title": "Cool room (18–20°C)", "description": "Air out for a few minutes if possible." }, "de": { "title": "Kühles Zimmer (18–20°C)", "description": "Wenn möglich kurz lüften." } },
"EASY_dormir_6": { "es": { "title": "Sin cafeína tarde", "description": "Después de las 14:00, mejor infusión." }, "en": { "title": "No late caffeine", "description": "After 2 pm, switch to herbal tea." }, "de": { "title": "Keine späte Koffeinzufuhr", "description": "Nach 14 Uhr lieber Kräutertee." } },
"EASY_dormir_7": { "es": { "title": "Oscuridad total", "description": "Persianas/cortinas o antifaz." }, "en": { "title": "Total darkness", "description": "Blinds/curtains or a sleep mask." }, "de": { "title": "Komplette Dunkelheit", "description": "Rollläden/Vorhänge oder Schlafmaske." } },
"EASY_dormir_8": { "es": { "title": "Respiración 4-7-8", "description": "4 inhala, 7 retén, 8 exhala (4–6 ciclos)." }, "en": { "title": "4-7-8 breathing", "description": "4 inhale, 7 hold, 8 exhale (4–6 cycles)." }, "de": { "title": "4-7-8-Atmung", "description": "4 einatmen, 7 halten, 8 ausatmen (4–6 Runden)." } },
"MEDIUM_dormir_9": { "es": { "title": "Ejercicio diurno", "description": "15–20 min; evita justo antes de dormir." }, "en": { "title": "Daytime exercise", "description": "15–20 min; not right before bed." }, "de": { "title": "Tagesbewegung", "description": "15–20 Min.; nicht direkt vor dem Schlafen." } },
"EASY_dormir_10": { "es": { "title": "Siestas cortas", "description": "Máx. 20 min y antes de las 16:00." }, "en": { "title": "Short naps", "description": "Max 20 min and before 4 pm." }, "de": { "title": "Kurze Nickerchen", "description": "Max. 20 Min. und vor 16 Uhr." } },
"EASY_dormir_11": { "es": { "title": "Ruido blanco", "description": "Lluvia suave o ruido blanco." }, "en": { "title": "White noise", "description": "Soft rain or white noise." }, "de": { "title": "Weißes Rauschen", "description": "Sanfter Regen oder White Noise." } },
"MEDIUM_dormir_12": { "es": { "title": "Escribe preocupaciones", "description": "3 pendientes y una acción por cada uno." }, "en": { "title": "Write worries down", "description": "List 3 concerns and one action each." }, "de": { "title": "Sorgen notieren", "description": "3 Punkte und je eine Maßnahme notieren." } },
"EASY_dormir_13": { "es": { "title": "Té relajante", "description": "Manzanilla o tila 60–90 min antes." }, "en": { "title": "Relaxing tea", "description": "Chamomile or linden 60–90 min before bed." }, "de": { "title": "Beruhigender Tee", "description": "Kamille oder Lindenblüte 60–90 Min. vorher." } },
"HARD_dormir_14": { "es": { "title": "Evalúa tu colchón", "description": "Investiga 2–3 opciones de calidad." }, "en": { "title": "Evaluate your mattress", "description": "Research 2–3 quality options." }, "de": { "title": "Matratze prüfen", "description": "2–3 hochwertige Optionen recherchieren." } },
"EASY_dormir_15": { "es": { "title": "Rutina nocturna", "description": "Ducha, té y lectura, en ese orden." }, "en": { "title": "Night routine", "description": "Shower, tea, and reading in order." }, "de": { "title": "Abendroutine", "description": "Dusche, Tee und Lesen in Reihenfolge." } },
"EASY_dormir_16": { "es": { "title": "Sin alcohol antes de dormir", "description": "Elige agua o infusión." }, "en": { "title": "No alcohol before bed", "description": "Choose water or herbal tea." }, "de": { "title": "Kein Alkohol vor dem Schlafen", "description": "Wasser oder Kräutertee wählen." } },
"EASY_dormir_17": { "es": { "title": "Medita 10 minutos", "description": "Céntrate en la respiración." }, "en": { "title": "Meditate 10 minutes", "description": "Focus on your breath." }, "de": { "title": "10 Minuten meditieren", "description": "Auf die Atmung fokussieren." } },
"EASY_dormir_18": { "es": { "title": "Lavanda", "description": "Difusor o gota en la almohada." }, "en": { "title": "Lavender", "description": "Diffuser or a drop on your pillow." }, "de": { "title": "Lavendel", "description": "Diffuser oder ein Tropfen aufs Kissen." } },
"MEDIUM_dormir_19": { "es": { "title": "Cena ligera y temprano", "description": "Termina ≥3 h antes de dormir." }, "en": { "title": "Light, early dinner", "description": "Finish ≥3 h before bedtime." }, "de": { "title": "Leicht und früh essen", "description": "Mind. 3 Std. vor dem Schlafen." } },
"EASY_dormir_20": { "es": { "title": "Luz natural matutina", "description": "Ventana o balcón 5–10 min." }, "en": { "title": "Morning daylight", "description": "Window or balcony for 5–10 min." }, "de": { "title": "Morgenlicht", "description": "5–10 Min. ans Fenster/Balkon." } },
"EASY_dormir_21": { "es": { "title": "Estira suave", "description": "5–10 min de relajación muscular." }, "en": { "title": "Gentle stretches", "description": "5–10 min of relaxing stretches." }, "de": { "title": "Sanftes Dehnen", "description": "5–10 Min. entspannendes Dehnen." } },
"EASY_dormir_22": { "es": { "title": "Solo dormir en la cama", "description": "Evita trabajar o ver TV en la cama." }, "en": { "title": "Bed is for sleep", "description": "Avoid work/TV in bed." }, "de": { "title": "Bett nur zum Schlafen", "description": "Kein Arbeiten/TV im Bett." } },
"EASY_dormir_23": { "es": { "title": "Calcetines si pies fríos", "description": "Pies calientes ayudan a conciliar." }, "en": { "title": "Socks if feet are cold", "description": "Warm feet help you fall asleep." }, "de": { "title": "Socken bei kalten Füßen", "description": "Warme Füße erleichtern das Einschlafen." } },
"MEDIUM_dormir_24": { "es": { "title": "Si no duermes, levántate", "description": "Tras 20 min despierto, cambia de estancia." }, "en": { "title": "Can’t sleep? Get up", "description": "After 20 min awake, change rooms." }, "de": { "title": "Kannst du nicht schlafen?", "description": "Nach 20 Min. aufstehen und den Raum wechseln." } },
"EASY_dormir_25": { "es": { "title": "Menos líquidos tarde", "description": "Evita beber la última hora." }, "en": { "title": "Limit late fluids", "description": "Avoid drinking in the last hour." }, "de": { "title": "Spät weniger trinken", "description": "In der letzten Stunde nichts mehr trinken." } },
"EASY_dormir_26": { "es": { "title": "Gratitud nocturna", "description": "Escribe 3 cosas buenas del día." }, "en": { "title": "Night gratitude", "description": "Write 3 good things from today." }, "de": { "title": "Abendliche Dankbarkeit", "description": "3 gute Dinge des Tages notieren." } },
"EASY_dormir_27": { "es": { "title": "Almohadas adecuadas", "description": "Ajusta altura y posición del cuello." }, "en": { "title": "Proper pillows", "description": "Adjust pillow height and neck position." }, "de": { "title": "Passende Kissen", "description": "Höhe und Nackenlage anpassen." } },
"EASY_dormir_28": { "es": { "title": "Evita discusiones", "description": "Temas difíciles, mejor mañana." }, "en": { "title": "Avoid arguments", "description": "Save tough talks for tomorrow." }, "de": { "title": "Streit vermeiden", "description": "Schwere Themen auf morgen verschieben." } },
"EASY_dormir_29": { "es": { "title": "Escaneo corporal", "description": "Relaja de pies a cabeza 3–5 min." }, "en": { "title": "Body scan", "description": "Relax head to toe for 3–5 min." }, "de": { "title": "Körper-Scan", "description": "3–5 Min. von Kopf bis Fuß entspannen." } },
"EASY_dormir_30": { "es": { "title": "Levántate a la misma hora", "description": "Incluido fin de semana." }, "en": { "title": "Wake up at the same time", "description": "Even on weekends." }, "de": { "title": "Zur gleichen Zeit aufstehen", "description": "Auch am Wochenende." } },

  "EASY_dormir_31": {
    "es": { "title": "Ventila el dormitorio 10 minutos", "description": "Abre la ventana por la mañana o al atardecer." },
    "en": { "title": "Air out the bedroom for 10 minutes", "description": "Open the window in the morning or at dusk." },
    "de": { "title": "Schlafzimmer 10 Minuten lüften", "description": "Morgens oder bei Dämmerung das Fenster öffnen." }
  },
  "EASY_dormir_32": {
    "es": { "title": "Baja la luz 1 hora antes", "description": "Usa iluminación tenue o lámpara de mesa." },
    "en": { "title": "Dim lights 1 hour before bed", "description": "Use soft lighting or a table lamp." },
    "de": { "title": "Licht 1 Stunde vorher dimmen", "description": "Sanftes Licht oder Tischlampe verwenden." }
  },
  "EASY_dormir_33": {
    "es": { "title": "Cena ligera con triptófano", "description": "Incluye huevo, yogur o pavo en pequeña porción." },
    "en": { "title": "Light tryptophan-rich dinner", "description": "Include egg, yogurt, or turkey in a small portion." },
    "de": { "title": "Leichtes Abendessen mit Tryptophan", "description": "Ei, Joghurt oder Pute in kleiner Portion einbauen." }
  },
  "EASY_dormir_34": {
    "es": { "title": "Ordena tu mesita de noche", "description": "Deja solo lo esencial para una mente calma." },
    "en": { "title": "Tidy your bedside table", "description": "Keep only essentials to calm the mind." },
    "de": { "title": "Nachttisch aufräumen", "description": "Nur das Nötigste liegen lassen – für Ruhe im Kopf." }
  },
  "EASY_dormir_35": {
    "es": { "title": "Activa “No molestar” automático", "description": "Programa el modo silencioso nocturno en el móvil." },
    "en": { "title": "Enable automatic Do Not Disturb", "description": "Schedule nighttime silent mode on your phone." },
    "de": { "title": "Automatischen „Nicht stören“-Modus aktivieren", "description": "Nacht-Stummmodus am Handy einplanen." }
  },
  "EASY_dormir_36": {
    "es": { "title": "Elige pijama y ropa de cama adecuados", "description": "Evita calor/frío: tejidos transpirables." },
    "en": { "title": "Pick proper pajamas and bedding", "description": "Avoid too hot/cold: use breathable fabrics." },
    "de": { "title": "Passende Schlafkleidung und Bettwäsche", "description": "Nicht zu warm/kalt – atmungsaktive Stoffe nutzen." }
  },
  "EASY_dormir_37": {
    "es": { "title": "Lava sábanas esta semana", "description": "La higiene favorece un mejor descanso." },
    "en": { "title": "Wash sheets this week", "description": "Clean bedding supports better sleep." },
    "de": { "title": "Bettwäsche diese Woche waschen", "description": "Saubere Bettwäsche fördert den Schlaf." }
  },
  "EASY_dormir_38": {
    "es": { "title": "Almohada entre las rodillas", "description": "Mejora la postura y relaja la espalda si duermes de lado." },
    "en": { "title": "Pillow between knees", "description": "Improves posture and relaxes the back when side-sleeping." },
    "de": { "title": "Kissen zwischen die Knie", "description": "Verbessert Haltung und entspannt den Rücken in Seitenlage." }
  },
  "EASY_dormir_39": {
    "es": { "title": "Usa luz roja/ámbar por la noche", "description": "Evita luz blanca/azul en el dormitorio." },
    "en": { "title": "Use red/amber light at night", "description": "Avoid white/blue light in the bedroom." },
    "de": { "title": "Abends rotes/bernsteinfarbenes Licht", "description": "Weißes/blaues Licht im Schlafzimmer vermeiden." }
  },
  "EASY_dormir_40": {
    "es": { "title": "Luz natural al mediodía", "description": "Sal 10–15 minutos para reforzar ritmos circadianos." },
    "en": { "title": "Midday natural light", "description": "Go outside 10–15 minutes to support circadian rhythm." },
    "de": { "title": "Natürliches Licht am Mittag", "description": "10–15 Minuten rausgehen – gut für den Biorhythmus." }
  },
  "EASY_dormir_41": {
    "es": { "title": "Evita nicotina por la tarde", "description": "Reduce estimulantes a partir de las 16:00." },
    "en": { "title": "Avoid nicotine in the afternoon", "description": "Cut stimulants after 4 p.m." },
    "de": { "title": "Nachmittags auf Nikotin verzichten", "description": "Stimulanzien ab 16 Uhr reduzieren." }
  },
  "EASY_dormir_42": {
    "es": { "title": "Evita comidas picantes por la noche", "description": "Facilita la digestión antes de dormir." },
    "en": { "title": "Skip spicy dinners", "description": "Make digestion easier before bedtime." },
    "de": { "title": "Abends keine scharfen Speisen", "description": "So wird die Verdauung vor dem Schlafen leichter." }
  },
  "EASY_dormir_43": {
    "es": { "title": "Diario de sueño 3 noches", "description": "Anota horas y calidad de tu sueño." },
    "en": { "title": "Sleep log for 3 nights", "description": "Record bed/wake times and sleep quality." },
    "de": { "title": "Schlaftagebuch für 3 Nächte", "description": "Zubett-/Aufstehzeiten und Schlafqualität notieren." }
  },
  "EASY_dormir_44": {
    "es": { "title": "Baño de pies tibio", "description": "Relaja 10–15 minutos antes de acostarte." },
    "en": { "title": "Warm foot bath", "description": "Relax 10–15 minutes before bed." },
    "de": { "title": "Warmes Fußbad", "description": "10–15 Minuten vor dem Schlafengehen entspannen." }
  },
  "EASY_dormir_45": {
    "es": { "title": "Hoy sin siesta", "description": "Si la necesitas, que sea corta y temprano." },
    "en": { "title": "No nap today", "description": "If needed, keep it short and early." },
    "de": { "title": "Heute kein Nickerchen", "description": "Falls nötig, kurz und früh halten." }
  },
  "EASY_dormir_46": {
    "es": { "title": "Café descafeinado por la tarde", "description": "Evita cafeína después de las 14:00." },
    "en": { "title": "Decaf in the afternoon", "description": "Avoid caffeine after 2 p.m." },
    "de": { "title": "Nachmittags entkoffeiniert", "description": "Nach 14 Uhr Koffein vermeiden." }
  },
  "EASY_dormir_47": {
    "es": { "title": "Despeja el dormitorio de dispositivos", "description": "Fuera portátiles/TV; el móvil lejos de la cama." },
    "en": { "title": "Remove devices from bedroom", "description": "No laptops/TV; keep the phone away from bed." },
    "de": { "title": "Geräte aus dem Schlafzimmer", "description": "Keine Laptops/TV; Handy nicht neben dem Bett." }
  },
  "EASY_dormir_48": {
    "es": { "title": "Tapones y antifaz listos", "description": "Reduce ruido y luz ambiental." },
    "en": { "title": "Earplugs and sleep mask", "description": "Reduce noise and ambient light." },
    "de": { "title": "Ohrenstöpsel und Schlafmaske", "description": "Lärm und Umgebungslicht reduzieren." }
  },
  "EASY_dormir_49": {
    "es": { "title": "Estiramientos cervicales 5 minutos", "description": "Libera tensión de cuello y hombros." },
    "en": { "title": "Neck stretches for 5 minutes", "description": "Release neck and shoulder tension." },
    "de": { "title": "5 Minuten Nacken-Dehnung", "description": "Verspannungen in Nacken und Schultern lösen." }
  },
  "EASY_dormir_50": {
    "es": { "title": "Lectura en papel con luz cálida", "description": "Evita pantallas y brillo alto." },
    "en": { "title": "Read on paper with warm light", "description": "Avoid screens and high brightness." },
    "de": { "title": "Lesen auf Papier mit warmem Licht", "description": "Bildschirme und hohe Helligkeit vermeiden." }
  },
  "EASY_dormir_51": {
    "es": { "title": "Escribe tu “mejor momento” del día", "description": "Cierra el día con una nota positiva." },
    "en": { "title": "Write today’s best moment", "description": "End the day on a positive note." },
    "de": { "title": "Besten Moment des Tages notieren", "description": "Den Tag mit einer positiven Notiz beenden." }
  },
  "EASY_dormir_52": {
    "es": { "title": "Piernas en la pared 3–5 min", "description": "Postura restaurativa para calmar el sistema nervioso." },
    "en": { "title": "Legs up the wall (3–5 min)", "description": "Restorative pose to calm your nervous system." },
    "de": { "title": "Beine an der Wand (3–5 Min.)", "description": "Regenerative Haltung zur Beruhigung des Nervensystems." }
  },
  "EASY_dormir_53": {
    "es": { "title": "Respiración “box” 4-4-4-4", "description": "4s inhalar, 4s retener, 4s exhalar, 4s retener (4–6 ciclos)." },
    "en": { "title": "Box breathing 4-4-4-4", "description": "Inhale 4s, hold 4s, exhale 4s, hold 4s (4–6 rounds)." },
    "de": { "title": "Box-Atmung 4-4-4-4", "description": "4 Sek. einatmen, 4 halten, 4 ausatmen, 4 halten (4–6 Runden)." }
  },
  "EASY_dormir_54": {
    "es": { "title": "Activa filtro de luz azul", "description": "Configura “Night Shift” o filtro nocturno." },
    "en": { "title": "Enable blue-light filter", "description": "Turn on Night Shift/blue-light filter." },
    "de": { "title": "Blaulichtfilter aktivieren", "description": "Night-Shift/Blaulichtfilter einschalten." }
  },
  "EASY_dormir_55": {
    "es": { "title": "Mocktail sin alcohol", "description": "Bebida nocturna sin alcohol ni cafeína." },
    "en": { "title": "Alcohol-free mocktail", "description": "Night drink with no alcohol or caffeine." },
    "de": { "title": "Alkoholfreier Mocktail", "description": "Abendgetränk ohne Alkohol und Koffein." }
  },
  "EASY_dormir_56": {
    "es": { "title": "Plan de mañana en 3 puntos", "description": "Anota las 3 primeras tareas de mañana." },
    "en": { "title": "Plan three tasks for tomorrow", "description": "Write down your first three tasks." },
    "de": { "title": "Drei Aufgaben für morgen planen", "description": "Die ersten drei Aufgaben notieren." }
  },
  "EASY_dormir_57": {
    "es": { "title": "Difusor 30 min antes de dormir", "description": "Lavanda o manzanilla en dosis suave." },
    "en": { "title": "Diffuser 30 min before bed", "description": "Use lavender or chamomile lightly." },
    "de": { "title": "Diffuser 30 Min. vor dem Schlafen", "description": "Lavendel oder Kamille dezent verwenden." }
  },
  "EASY_dormir_58": {
    "es": { "title": "Paseo suave al atardecer", "description": "Camina 10–15 minutos para desconectar." },
    "en": { "title": "Easy sunset walk", "description": "Walk 10–15 minutes to unwind." },
    "de": { "title": "Entspannter Abendspaziergang", "description": "10–15 Minuten gehen zum Abschalten." }
  },
  "EASY_dormir_59": {
    "es": { "title": "Última bebida 1 hora antes", "description": "Evita levantarte por la noche al baño." },
    "en": { "title": "Last drink 1 hour before bed", "description": "Reduce nighttime bathroom trips." },
    "de": { "title": "Letztes Getränk 1 Stunde vorher", "description": "Nächtliche Toilettengänge reduzieren." }
  },
  "EASY_dormir_60": {
    "es": { "title": "Auto-masaje cuello y hombros", "description": "5 minutos de presión suave o con rodillo." },
    "en": { "title": "Self-massage neck & shoulders", "description": "5 minutes of gentle pressure or roller." },
    "de": { "title": "Selbstmassage Nacken & Schultern", "description": "5 Minuten sanfter Druck oder mit Rolle." }
  },



  // Eliminar estrés (stress_1 a stress_30)
  "EASY_stress_1": { "es": { "title": "Respira 5 minutos", "description": "Inhala 4s, exhala 6s durante 5 min." }, "en": { "title": "Breathe for 5 minutes", "description": "Inhale 4s, exhale 6s for 5 min." }, "de": { "title": "5 Minuten atmen", "description": "4 Sek. ein, 6 Sek. aus für 5 Min." } },
  "EASY_stress_2": { "es": { "title": "Medita 10 minutos", "description": "Meditación guiada corta en casa." }, "en": { "title": "Meditate 10 minutes", "description": "Short guided session at home." }, "de": { "title": "10 Min. meditieren", "description": "Kurze geführte Einheit zu Hause." } },
  "MEDIUM_stress_3": { "es": { "title": "Paseo consciente", "description": "10–15 min cerca de casa o pasillo." }, "en": { "title": "Mindful walk", "description": "10–15 min near home or hallway." }, "de": { "title": "Achtsamer Spaziergang", "description": "10–15 Min. nahe der Wohnung oder im Flur." } },
  "EASY_stress_4": { "es": { "title": "Diario breve", "description": "3–5 líneas: qué sientes y qué necesitas." }, "en": { "title": "Short journaling", "description": "3–5 lines: what you feel and need." }, "de": { "title": "Kurzes Journaling", "description": "3–5 Zeilen: was du fühlst und brauchst." } },
  "MEDIUM_stress_5": { "es": { "title": "Yoga 20 minutos", "description": "Secuencia suave en esterilla/alfombra." }, "en": { "title": "Yoga 20 minutes", "description": "Gentle sequence on mat or carpet." }, "de": { "title": "Yoga 20 Min.", "description": "Sanfte Abfolge auf Matte/Teppich." } },
  "EASY_stress_6": { "es": { "title": "Música relajante", "description": "Lista calmada 10–15 min." }, "en": { "title": "Relaxing music", "description": "Calm playlist for 10–15 min." }, "de": { "title": "Entspannungsmusik", "description": "Ruhige Playlist 10–15 Min." } },
  "EASY_stress_7": { "es": { "title": "Habla con alguien", "description": "Llama o manda audio." }, "en": { "title": "Talk to someone", "description": "Call or send a voice note." }, "de": { "title": "Mit jemandem reden", "description": "Anrufen oder Sprachnachricht senden." } },
  "EASY_stress_8": { "es": { "title": "Practica gratitud", "description": "Escribe 3 cosas buenas de hoy." }, "en": { "title": "Practice gratitude", "description": "Write down 3 good things today." }, "de": { "title": "Dankbarkeit üben", "description": "3 gute Dinge des Tages notieren." } },
  "MEDIUM_stress_9": { "es": { "title": "Pausa de redes 1–3h", "description": "Activa modo concentración." }, "en": { "title": "Social-media break 1–3h", "description": "Use focus/do-not-disturb mode." }, "de": { "title": "Soziale Medien pausieren", "description": "1–3 Std. Fokus-Modus aktivieren." } },
  "MEDIUM_stress_10": { "es": { "title": "Baño relajante", "description": "Tibio con sal o espuma 15–20 min." }, "en": { "title": "Relaxing bath", "description": "Warm bath with salt/foam 15–20 min." }, "de": { "title": "Entspannungsbad", "description": "Warm, mit Salz/Schaum 15–20 Min." } },
  "MEDIUM_stress_11": { "es": { "title": "Cardio suave 15–20 min", "description": "Libera tensión con movimiento." }, "en": { "title": "Light cardio 15–20 min", "description": "Release tension with movement." }, "de": { "title": "Leichtes Cardio 15–20 Min.", "description": "Spannung mit Bewegung lösen." } },
  "EASY_stress_12": { "es": { "title": "Mindful eating", "description": "Una comida sin pantallas, saboreando." }, "en": { "title": "Mindful eating", "description": "One screen-free, savoring meal." }, "de": { "title": "Achtsames Essen", "description": "Eine Mahlzeit ohne Bildschirm, bewusst genießen." } },
  "EASY_stress_13": { "es": { "title": "Organiza un cajón", "description": "Ordena 10–15 minutos." }, "en": { "title": "Tidy a drawer", "description": "Declutter for 10–15 minutes." }, "de": { "title": "Eine Schublade ordnen", "description": "10–15 Min. aufräumen." } },
  "MEDIUM_stress_14": { "es": { "title": "Di que no", "description": "Pon un límite respetuoso por mensaje." }, "en": { "title": "Say no", "description": "Set a respectful boundary via message." }, "de": { "title": "Nein sagen", "description": "Wertschätzend per Nachricht abgrenzen." } },
  "EASY_stress_15": { "es": { "title": "Visualiza tu lugar tranquilo", "description": "3–5 min con respiración lenta." }, "en": { "title": "Visualize a calm place", "description": "3–5 min with slow breathing." }, "de": { "title": "Ruhigen Ort visualisieren", "description": "3–5 Min. mit ruhiger Atmung." } },
  "MEDIUM_stress_16": { "es": { "title": "Pausa digital 1 hora", "description": "Sin móvil ni PC salvo llamadas." }, "en": { "title": "Digital break 1 hour", "description": "No phone/PC except calls." }, "de": { "title": "Digitale Pause 1 Std.", "description": "Ohne Handy/PC, außer Anrufe." } },
  "EASY_stress_17": { "es": { "title": "Ríe un rato", "description": "Clip divertido 5–10 min." }, "en": { "title": "Have a laugh", "description": "Watch a funny clip 5–10 min." }, "de": { "title": "Lachen", "description": "5–10 Min. lustigen Clip schauen." } },
  "EASY_stress_18": { "es": { "title": "Acaricia una mascota", "description": "5–10 min de mimos conscientes." }, "en": { "title": "Pet a cat/dog", "description": "5–10 min of mindful cuddles." }, "de": { "title": "Haustier streicheln", "description": "5–10 Min. bewusst kuscheln." } },
  "EASY_stress_19": { "es": { "title": "Estira 10 minutos", "description": "Cuello, hombros y espalda." }, "en": { "title": "Stretch 10 minutes", "description": "Neck, shoulders, back." }, "de": { "title": "10 Minuten dehnen", "description": "Nacken, Schultern, Rücken." } },
  "MEDIUM_stress_20": { "es": { "title": "Técnica Pomodoro", "description": "2 ciclos: 25 min foco + 5 min descanso." }, "en": { "title": "Pomodoro technique", "description": "2 rounds: 25 min focus + 5 min break." }, "de": { "title": "Pomodoro-Technik", "description": "2 Runden: 25 Min. Fokus + 5 Min. Pause." } },
  "EASY_stress_21": { "es": { "title": "Té de hierbas", "description": "Infusión calmante, bébela despacio." }, "en": { "title": "Herbal tea", "description": "Soothing infusion, sip slowly." }, "de": { "title": "Kräutertee", "description": "Beruhigender Tee, langsam trinken." } },
  "EASY_stress_22": { "es": { "title": "Abrazo de 20–30s", "description": "Con alguien de confianza o autoabrazo." }, "en": { "title": "20–30s hug", "description": "With someone you trust or self-hug." }, "de": { "title": "20–30 Sek. Umarmung", "description": "Mit Vertrauensperson oder Selbstumarmung." } },
  "MEDIUM_stress_23": { "es": { "title": "Tai chi/movimiento lento", "description": "10–15 min de movimientos guiados." }, "en": { "title": "Tai chi/slow movement", "description": "10–15 min guided motions." }, "de": { "title": "Tai-Chi/langsame Bewegung", "description": "10–15 Min. geführte Bewegungen." } },
  "MEDIUM_stress_24": { "es": { "title": "Prioriza 1 tarea", "description": "Lista 3 y marca una prioridad real." }, "en": { "title": "Prioritize 1 task", "description": "List 3 and pick one true priority." }, "de": { "title": "1 Aufgabe priorisieren", "description": "3 notieren und eine echte Priorität wählen." } },
  "EASY_stress_25": { "es": { "title": "Haz algo creativo", "description": "Dibuja, colorea o cocina algo simple." }, "en": { "title": "Do something creative", "description": "Draw, color, or cook something simple." }, "de": { "title": "Kreativ sein", "description": "Zeichnen, malen oder etwas Einfaches kochen." } },
  "MEDIUM_stress_26": { "es": { "title": "Relajación muscular", "description": "Tensa/relaja grupos 8–10 min." }, "en": { "title": "Muscle relaxation", "description": "Tense/release groups for 8–10 min." }, "de": { "title": "Muskelentspannung", "description": "Muskelgruppen 8–10 Min. an-/entspannen." } },
  "EASY_stress_27": { "es": { "title": "Aromaterapia casera", "description": "Difusor o gota en muñecas." }, "en": { "title": "Home aromatherapy", "description": "Diffuser or a drop on wrists." }, "de": { "title": "Aromatherapie zuhause", "description": "Diffuser oder Tropfen auf die Handgelenke." } },
  "MEDIUM_stress_28": { "es": { "title": "Delega cuando puedas", "description": "Pide ayuda con 1 tarea concreta." }, "en": { "title": "Delegate when possible", "description": "Ask help for one concrete task." }, "de": { "title": "Delegieren, wenn möglich", "description": "Um Hilfe bei einer konkreten Aufgabe bitten." } },
  "EASY_stress_29": { "es": { "title": "Observa el atardecer", "description": "Ventana/balcón y respiración lenta." }, "en": { "title": "Watch the sunset", "description": "Window/balcony with slow breathing." }, "de": { "title": "Sonnenuntergang ansehen", "description": "Am Fenster/Balkon langsam atmen." } },
  "EASY_stress_30": { "es": { "title": "Afirmaciones positivas", "description": "Repite 3 frases de apoyo personal." }, "en": { "title": "Positive affirmations", "description": "Repeat 3 self-supportive phrases." }, "de": { "title": "Positive Affirmationen", "description": "3 selbststärkende Sätze wiederholen." } },
  
  "EASY_stress_31": {
    "es": { "title": "Técnica 5-4-3-2-1", "description": "Nombra 5 que ves, 4 que sientes, 3 que oyes, 2 que hueles y 1 que saboreas." },
    "en": { "title": "5-4-3-2-1 grounding", "description": "Name 5 you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste." },
    "de": { "title": "5-4-3-2-1-Methode", "description": "Benenne 5 die du siehst, 4 fühlst, 3 hörst, 2 riechst, 1 schmeckst." }
  },
  "EASY_stress_32": {
    "es": { "title": "Vacía la mente en papel", "description": "Escribe preocupaciones y una micro-acción para cada una." },
    "en": { "title": "Brain dump on paper", "description": "Write worries and one tiny next step for each." },
    "de": { "title": "Gedanken aufschreiben", "description": "Sorge notieren und je einen kleinen nächsten Schritt definieren." }
  },
  "EASY_stress_33": {
    "es": { "title": "Aire fresco 5 minutos", "description": "Ventana o balcón, respira con atención." },
    "en": { "title": "Fresh air for 5 minutes", "description": "Stand at a window/balcony and breathe mindfully." },
    "de": { "title": "5 Minuten Frischluft", "description": "Am Fenster/Balkon achtsam atmen." }
  },
  "EASY_stress_34": {
    "es": { "title": "Relaja mandíbula y hombros", "description": "Tensa 3s e intenta soltar con la exhalación, 5 repeticiones." },
    "en": { "title": "Relax jaw and shoulders", "description": "Tense 3s, exhale and release; repeat 5 times." },
    "de": { "title": "Kiefer und Schultern entspannen", "description": "3 Sek. anspannen, beim Ausatmen lösen; 5-mal." }
  },
  "EASY_stress_35": {
    "es": { "title": "Autoabrazo 30 segundos", "description": "Cruza brazos y sostente con respiración lenta." },
    "en": { "title": "Self-hug for 30 seconds", "description": "Cross arms over chest and breathe slowly." },
    "de": { "title": "Selbstumarmung 30 Sekunden", "description": "Arme kreuzen und ruhig atmen." }
  },
  "EASY_stress_36": {
    "es": { "title": "Respira con labios fruncidos", "description": "Inhala 2s por nariz, exhala 4s por labios durante 3 min." },
    "en": { "title": "Pursed-lip breathing", "description": "Inhale 2s nose, exhale 4s lips for 3 minutes." },
    "de": { "title": "Lippenbremse-Atmung", "description": "2 Sek. durch die Nase ein, 4 Sek. durch die Lippen aus – 3 Min." }
  },
  "EASY_stress_37": {
    "es": { "title": "Escritura automática 3 min", "description": "Escribe sin parar ni editar; deja que fluya." },
    "en": { "title": "Automatic writing 3 min", "description": "Write continuously without editing; let it flow." },
    "de": { "title": "Automatisches Schreiben 3 Min.", "description": "Ohne Pause/Redaktion schreiben – einfach fließen lassen." }
  },
  "EASY_stress_38": {
    "es": { "title": "Semáforo mental", "description": "Rojo: parar. Amarillo: respirar. Verde: dar el siguiente paso." },
    "en": { "title": "Mental traffic light", "description": "Red: stop. Yellow: breathe. Green: take the next step." },
    "de": { "title": "Mentale Ampel", "description": "Rot: stoppen. Gelb: atmen. Grün: nächsten Schritt tun." }
  },
  "EASY_stress_39": {
    "es": { "title": "Estira pectoral en puerta", "description": "Marco de puerta, 2×30s por lado, abre el pecho." },
    "en": { "title": "Doorway chest stretch", "description": "Hold 2×30s each side to open the chest." },
    "de": { "title": "Brustdehnung im Türrahmen", "description": "Je Seite 2×30 Sek. halten – Brust öffnen." }
  },
  "EASY_stress_40": {
    "es": { "title": "Escucha el entorno 2 min", "description": "Distingue sonidos cercanos y lejanos con ojos cerrados." },
    "en": { "title": "Sound scan 2 minutes", "description": "With eyes closed, notice near and far sounds." },
    "de": { "title": "Klangscan 2 Minuten", "description": "Mit geschlossenen Augen nahe und ferne Geräusche wahrnehmen." }
  },
  "EASY_stress_41": {
    "es": { "title": "Micro-descanso 3 minutos", "description": "Ojos cerrados, manos en abdomen, respiración lenta." },
    "en": { "title": "Micro break 3 minutes", "description": "Eyes closed, hands on belly, slow breath." },
    "de": { "title": "Mikropause 3 Minuten", "description": "Augen schließen, Hände auf den Bauch, langsam atmen." }
  },
  "EASY_stress_42": {
    "es": { "title": "Masaje de manos 2 min", "description": "Presiona palma y dedos en círculos suaves." },
    "en": { "title": "Hand massage 2 min", "description": "Gently circle-press palm and fingers." },
    "de": { "title": "Handmassage 2 Min.", "description": "Sanfter Druck in kreisenden Bewegungen auf Handfläche und Finger." }
  },
  "EASY_stress_43": {
    "es": { "title": "Lista “no pasa nada si…”", "description": "Escribe 3 cosas que puedes soltar hoy sin problema." },
    "en": { "title": "“It’s okay if…” list", "description": "Write 3 things you can let go of today." },
    "de": { "title": "„Es ist ok, wenn …“-Liste", "description": "Notiere 3 Dinge, die du heute loslassen kannst." }
  },
  "EASY_stress_44": {
    "es": { "title": "Gratitud por una persona", "description": "Escribe 1 motivo para agradecer a alguien." },
    "en": { "title": "Gratitude for someone", "description": "Write one reason to thank a person." },
    "de": { "title": "Dankbarkeit für eine Person", "description": "Schreibe einen Grund, jemandem zu danken." }
  },
  "EASY_stress_45": {
    "es": { "title": "Descanso visual 20-20-20", "description": "Cada 20 min, mira a 6 m durante 20 s." },
    "en": { "title": "20-20-20 eye break", "description": "Every 20 min, look 20 s at ~6 m distance." },
    "de": { "title": "20-20-20-Augenpause", "description": "Alle 20 Min. 20 Sek. in ~6 m Entfernung schauen." }
  },
  "EASY_stress_46": {
    "es": { "title": "Reencuadre en 1 frase", "description": "Transforma un pensamiento en una versión realista y útil." },
    "en": { "title": "One-line reframing", "description": "Turn a thought into a realistic, helpful version." },
    "de": { "title": "Reframing in einem Satz", "description": "Einen Gedanken realistisch und hilfreich umformulieren." }
  },
  "EASY_stress_47": {
    "es": { "title": "Límite amable por chat", "description": "Crea una plantilla breve para decir “no” con respeto." },
    "en": { "title": "Kind boundary template", "description": "Draft a short respectful “no” message template." },
    "de": { "title": "Freundliche Grenz-Vorlage", "description": "Kurze, respektvolle „Nein“-Nachricht als Vorlage erstellen." }
  },
  "EASY_stress_48": {
    "es": { "title": "Respiración coherente 6-6", "description": "Inhala 6s y exhala 6s durante 3–5 min." },
    "en": { "title": "Coherent breathing 6-6", "description": "Inhale 6s, exhale 6s for 3–5 min." },
    "de": { "title": "Kohärente Atmung 6-6", "description": "6 Sek. ein- und 6 Sek. ausatmen für 3–5 Min." }
  },
  "EASY_stress_49": {
    "es": { "title": "Agua tibia en las manos", "description": "Siente la temperatura 2 min para aterrizar el cuerpo." },
    "en": { "title": "Warm water on hands", "description": "Feel the temperature for 2 min to ground yourself." },
    "de": { "title": "Lauwarmes Wasser an den Händen", "description": "2 Min. die Temperatur spüren – zum Erden." }
  },
  "EASY_stress_50": {
    "es": { "title": "Garabatea 5 minutos", "description": "Dibuja líneas y formas sin objetivo." },
    "en": { "title": "Doodle for 5 minutes", "description": "Draw lines and shapes with no goal." },
    "de": { "title": "5 Minuten kritzeln", "description": "Linien und Formen ohne Ziel zeichnen." }
  },
  "EASY_stress_51": {
    "es": { "title": "Mini-playlist calmante", "description": "Guarda 3 canciones que te relajen." },
    "en": { "title": "Mini calming playlist", "description": "Save 3 songs that relax you." },
    "de": { "title": "Mini-Playlist zum Entspannen", "description": "3 Lieder speichern, die dich beruhigen." }
  },
  "EASY_stress_52": {
    "es": { "title": "Higiene digital express", "description": "Reordena o elimina 5 apps/atajos estresantes." },
    "en": { "title": "Express digital hygiene", "description": "Reorder or remove 5 stressful apps/shortcuts." },
    "de": { "title": "Digitale Schnell-Hygiene", "description": "5 stressende Apps/Shortcuts umordnen oder löschen." }
  },
  "EASY_stress_53": {
    "es": { "title": "Camina en cuadrado consciente", "description": "4 lados de 20 pasos, atento a plantas y respiración." },
    "en": { "title": "Mindful square walk", "description": "4 sides of 20 steps, notice feet and breath." },
    "de": { "title": "Achtsamer Quadrat-Gang", "description": "4 Seiten à 20 Schritte – Füße und Atem spüren." }
  },
  "EASY_stress_54": {
    "es": { "title": "Aroma cítrico rápido", "description": "Inhala aroma de cítrico 6 veces lentamente." },
    "en": { "title": "Quick citrus aroma", "description": "Inhale a citrus scent slowly 6 times." },
    "de": { "title": "Schneller Zitrus-Duft", "description": "Zitrusduft 6-mal langsam einatmen." }
  },
  "EASY_stress_55": {
    "es": { "title": "Tapping EFT 2 minutos", "description": "Golpecitos suaves en puntos faciales con respiración lenta." },
    "en": { "title": "EFT tapping 2 minutes", "description": "Gentle taps on facial points while breathing slowly." },
    "de": { "title": "EFT-Tapping 2 Minuten", "description": "Sanftes Klopfen auf Gesichtspunkten bei ruhiger Atmung." }
  },
  "EASY_stress_56": {
    "es": { "title": "Mira algo verde 5 minutos", "description": "Observa plantas o árboles y describe sus detalles." },
    "en": { "title": "Gaze at green for 5 minutes", "description": "Look at plants/trees and describe details." },
    "de": { "title": "5 Minuten ins Grüne schauen", "description": "Pflanzen/Bäume ansehen und Details beschreiben." }
  },
  "EASY_stress_57": {
    "es": { "title": "Nota “lo pensaré mañana”", "description": "Escribe rumiaciones y cierra el cuaderno por hoy." },
    "en": { "title": "“I’ll think about it tomorrow” note", "description": "Write ruminations down and close the notebook." },
    "de": { "title": "Notiz „Morgen weiterdenken“", "description": "Grübeleien notieren und das Heft schließen." }
  },
  "EASY_stress_58": {
    "es": { "title": "Define 1 micro-meta", "description": "Elige una acción ≤5 min y complétala ahora." },
    "en": { "title": "Set one micro-goal", "description": "Pick an action ≤5 min and do it now." },
    "de": { "title": "Ein Mikro-Ziel setzen", "description": "Eine ≤5-Minuten-Aufgabe wählen und jetzt erledigen." }
  },
  "EASY_stress_59": {
    "es": { "title": "Agua en la cara lentamente", "description": "Lava el rostro sintiendo el contacto y la temperatura." },
    "en": { "title": "Slow face splash", "description": "Wash your face noticing contact and temperature." },
    "de": { "title": "Langsames Gesichtwaschen", "description": "Gesicht waschen und Kontakt/Temperatur bewusst spüren." }
  },
  "EASY_stress_60": {
    "es": { "title": "Sonrisa suave 1 minuto", "description": "Mantén una leve sonrisa para inducir calma (biofeedback)." },
    "en": { "title": "Soft smile for 1 minute", "description": "Hold a gentle smile to induce calm (biofeedback)." },
    "de": { "title": "Sanftes Lächeln 1 Minute", "description": "Ein leichtes Lächeln halten – beruhigt (Biofeedback)." }
  },
    // Dejar de fumar (fumar_1 a fumar_30)
  "EASY_fumar_1": { "es": { "title": "Retrasa el primer cigarro", "description": "Espera 60 min y ocúpate con algo breve." }, "en": { "title": "Delay the first cigarette", "description": "Wait 60 min and keep busy with a quick task." }, "de": { "title": "Erste Zigarette verzögern", "description": "60 Min. warten und kurz beschäftigen." } },
"EASY_fumar_2": { "es": { "title": "Bebe agua al tener ganas", "description": "Toma 200–300 ml cuando aparezca el impulso." }, "en": { "title": "Drink water when cravings hit", "description": "Have 200–300 ml when the urge appears." }, "de": { "title": "Wasser bei Verlangen trinken", "description": "200–300 ml trinken, wenn das Verlangen kommt." } },
"EASY_fumar_3": { "es": { "title": "10 respiraciones profundas", "description": "Patrón 4-4-6 durante 10 ciclos." }, "en": { "title": "10 deep breaths", "description": "Use a 4-4-6 pattern for 10 cycles." }, "de": { "title": "10 tiefe Atemzüge", "description": "Muster 4-4-6 für 10 Runden." } },
"MEDIUM_fumar_4": { "es": { "title": "Llama a un amigo", "description": "Sustituye el cigarro por una llamada o audio." }, "en": { "title": "Call a friend", "description": "Replace the cigarette with a call or voice note." }, "de": { "title": "Rufe einen Freund an", "description": "Zigarette durch Anruf oder Sprachnachricht ersetzen." } },
"MEDIUM_fumar_5": { "es": { "title": "Cambia tu rincón de fumar", "description": "Evita lugares que asocias al tabaco." }, "en": { "title": "Change your smoking spot", "description": "Avoid places you associate with smoking." }, "de": { "title": "Rauchplatz wechseln", "description": "Orte meiden, die du mit Rauchen verbindest." } },
"EASY_fumar_6": { "es": { "title": "Mastica chicle sin azúcar", "description": "Úsalo en picos de ganas." }, "en": { "title": "Chew sugar-free gum", "description": "Use it during cravings." }, "de": { "title": "Zuckerfreien Kaugummi kauen", "description": "Bei starkem Verlangen verwenden." } },
"EASY_fumar_7": { "es": { "title": "Calcula el ahorro", "description": "Apunta lo no gastado por cigarro evitado." }, "en": { "title": "Track your savings", "description": "Note what you save per avoided cigarette." }, "de": { "title": "Ersparnis berechnen", "description": "Notiere die Ersparnis pro vermiedener Zigarette." } },
"MEDIUM_fumar_8": { "es": { "title": "Ejercicio breve", "description": "2–5 min: sentadillas o jumping jacks." }, "en": { "title": "Short workout", "description": "2–5 min: squats or jumping jacks." }, "de": { "title": "Kurzes Workout", "description": "2–5 Min.: Kniebeugen oder Hampelmänner." } },
"EASY_fumar_9": { "es": { "title": "Medita 10 minutos", "description": "Guía breve o respiración consciente." }, "en": { "title": "Meditate 10 minutes", "description": "Short guided session or mindful breathing." }, "de": { "title": "10 Minuten meditieren", "description": "Kurze Anleitung oder achtsames Atmen." } },
"MEDIUM_fumar_10": { "es": { "title": "Tira ceniceros extra", "description": "Elimina recordatorios del hábito." }, "en": { "title": "Throw out spare ashtrays", "description": "Remove reminders of the habit." }, "de": { "title": "Zusatz-Aschenbecher entsorgen", "description": "Erinnerungen an die Gewohnheit entfernen." } },
"EASY_fumar_11": { "es": { "title": "Fruta contra antojos", "description": "Sustituye con fruta o frutos secos." }, "en": { "title": "Fruit for cravings", "description": "Swap in fruit or nuts." }, "de": { "title": "Obst gegen Gelüste", "description": "Durch Obst oder Nüsse ersetzen." } },
"EASY_fumar_12": { "es": { "title": "Lávate los dientes", "description": "Corta el impulso tras comer." }, "en": { "title": "Brush your teeth", "description": "Cut the post-meal urge." }, "de": { "title": "Zähne putzen", "description": "Unterbricht den Drang nach dem Essen." } },
"EASY_fumar_13": { "es": { "title": "Escribe tus motivos", "description": "Anota 3 razones y déjalas visibles." }, "en": { "title": "Write your reasons", "description": "List 3 reasons and keep them visible." }, "de": { "title": "Gründe aufschreiben", "description": "3 Gründe notieren und sichtbar platzieren." } },
"MEDIUM_fumar_14": { "es": { "title": "Evita alcohol hoy", "description": "Reduce disparadores de fumar." }, "en": { "title": "Skip alcohol today", "description": "Avoid smoking triggers." }, "de": { "title": "Heute keinen Alkohol", "description": "Rauch-Auslöser reduzieren." } },
"EASY_fumar_15": { "es": { "title": "Marca tu día sin fumar", "description": "✅ en el calendario y mini-recompensa." }, "en": { "title": "Mark smoke-free days", "description": "Add a ✅ and give yourself a small reward." }, "de": { "title": "Rauchfreie Tage markieren", "description": "✅ im Kalender und kleine Belohnung." } },
"MEDIUM_fumar_16": { "es": { "title": "Únete a un grupo online", "description": "Busca apoyo y comparte avances." }, "en": { "title": "Join an online group", "description": "Get support and share progress." }, "de": { "title": "Online-Gruppe beitreten", "description": "Unterstützung holen und Fortschritt teilen." } },
"EASY_fumar_17": { "es": { "title": "Relajación muscular", "description": "Progresa 5–10 min por grupos." }, "en": { "title": "Muscle relaxation", "description": "Progressive 5–10 min by groups." }, "de": { "title": "Muskelentspannung", "description": "Progressiv 5–10 Min. nach Muskelgruppen." } },
"EASY_fumar_18": { "es": { "title": "Cambia de ambiente", "description": "Vete a otra habitación y haz algo breve." }, "en": { "title": "Change your environment", "description": "Go to another room and do a quick task." }, "de": { "title": "Umgebung wechseln", "description": "In einen anderen Raum gehen und kurz etwas tun." } },
"EASY_fumar_19": { "es": { "title": "Manos ocupadas", "description": "Pelota antiestrés, lápiz o plastilina." }, "en": { "title": "Keep hands busy", "description": "Stress ball, pen, or putty." }, "de": { "title": "Hände beschäftigen", "description": "Antistress-Ball, Stift oder Knete." } },
"EASY_fumar_20": { "es": { "title": "Visualiza pulmones sanos", "description": "2 min imaginando tu mejora." }, "en": { "title": "Visualize healthy lungs", "description": "2 minutes imagining improvement." }, "de": { "title": "Gesunde Lungen visualisieren", "description": "2 Min. Verbesserung vorstellen." } },
"EASY_fumar_21": { "es": { "title": "Lee testimonios", "description": "1–2 historias breves de exfumadores." }, "en": { "title": "Read testimonials", "description": "1–2 short ex-smoker stories." }, "de": { "title": "Erfahrungen lesen", "description": "1–2 kurze Ex-Raucher-Geschichten." } },
"MEDIUM_fumar_22": { "es": { "title": "Evita café si dispara", "description": "Cámbialo por infusión o agua con limón." }, "en": { "title": "Skip coffee if it triggers you", "description": "Swap for tea or lemon water." }, "de": { "title": "Kein Kaffee bei Trigger", "description": "Durch Tee oder Zitronenwasser ersetzen." } },
"MEDIUM_fumar_23": { "es": { "title": "Recompensa con tu ahorro", "description": "Separa el dinero y elige premio saludable." }, "en": { "title": "Reward with your savings", "description": "Set aside money and pick a healthy reward." }, "de": { "title": "Mit Ersparnis belohnen", "description": "Geld beiseitelegen und gesunde Belohnung wählen." } },
"MEDIUM_fumar_24": { "es": { "title": "Parches o chicles de nicotina", "description": "Úsalos según indicaciones y regístralo." }, "en": { "title": "Nicotine gum/patch", "description": "Use as directed and log it." }, "de": { "title": "Nikotin-Kaugummi/Pflaster", "description": "Nach Anleitung nutzen und notieren." } },
"EASY_fumar_25": { "es": { "title": "Lista de disparadores", "description": "3 situaciones y tu respuesta." }, "en": { "title": "Trigger list", "description": "Note 3 situations and your response." }, "de": { "title": "Trigger-Liste", "description": "3 Situationen und deine Reaktion notieren." } },
"MEDIUM_fumar_26": { "es": { "title": "Practica decir «no»", "description": "Ensaya respuestas para rechazar." }, "en": { "title": "Practice saying “no”", "description": "Rehearse lines to refuse cigarettes." }, "de": { "title": "„Nein“ sagen üben", "description": "Sätze zum Ablehnen üben." } },
"MEDIUM_fumar_27": { "es": { "title": "Casa sin olor a tabaco", "description": "Ventila, lava telas y usa ambientador suave." }, "en": { "title": "Remove smoke smell", "description": "Air out, wash fabrics, use a mild freshener." }, "de": { "title": "Rauchgeruch entfernen", "description": "Lüften, Textilien waschen, milden Duft verwenden." } },
"EASY_fumar_28": { "es": { "title": "Duerme bien hoy", "description": "Pantallas fuera y 7–8 horas." }, "en": { "title": "Sleep well tonight", "description": "No screens late and aim for 7–8 hours." }, "de": { "title": "Heute gut schlafen", "description": "Späte Bildschirme vermeiden, 7–8 Std. anstreben." } },
"EASY_fumar_29": { "es": { "title": "Snacks saludables", "description": "Zanahoria, manzana o frutos secos." }, "en": { "title": "Healthy snacks", "description": "Carrot, apple, or nuts." }, "de": { "title": "Gesunde Snacks", "description": "Karotte, Apfel oder Nüsse." } },
"MEDIUM_fumar_30": { "es": { "title": "Diario del proceso", "description": "Fecha, ganas (0–10) y qué ayudó." }, "en": { "title": "Quit diary", "description": "Date, urge (0–10), and what helped." }, "de": { "title": "Rauchstopp-Tagebuch", "description": "Datum, Verlangen (0–10) und was half." } },

  "EASY_fumar_31": { "es": { "title": "Cambia tu rutina matutina", "description": "Sustituye el cigarro por un vaso de agua y 10 respiraciones." }, "en": { "title": "Change your morning routine", "description": "Swap the cigarette for a glass of water and 10 breaths." }, "de": { "title": "Morgenroutine ändern", "description": "Zigarette durch ein Glas Wasser und 10 Atemzüge ersetzen." } },
  "EASY_fumar_32": { "es": { "title": "Chicle o palo de canela", "description": "Ten chicle sin azúcar o un palo de canela para el impulso." }, "en": { "title": "Gum or cinnamon stick", "description": "Keep sugar-free gum or a cinnamon stick for cravings." }, "de": { "title": "Kaugummi oder Zimtstange", "description": "Zuckerfreien Kaugummi oder Zimtstange gegen Verlangen bereithalten." } },
  "EASY_fumar_33": { "es": { "title": "Retrasa 10 minutos", "description": "Cuando aparezca el impulso, espera 10 minutos y respira." }, "en": { "title": "Delay by 10 minutes", "description": "When a craving hits, wait 10 minutes and breathe." }, "de": { "title": "10 Minuten aufschieben", "description": "Bei Verlangen 10 Minuten warten und atmen." } },
  "EASY_fumar_34": { "es": { "title": "Lista SOS de 3 acciones", "description": "Escribe 3 cosas rápidas que harás ante el impulso." }, "en": { "title": "3-step SOS list", "description": "Write 3 quick actions to do when a craving hits." }, "de": { "title": "3-Punkte-SOS-Liste", "description": "Drei schnelle Maßnahmen für den Akutfall notieren." } },
  "EASY_fumar_35": { "es": { "title": "Agua cada antojo", "description": "Bebe 200–300 ml de agua antes de decidir." }, "en": { "title": "Water with every craving", "description": "Drink 200–300 ml of water before deciding." }, "de": { "title": "Wasser bei jedem Verlangen", "description": "Vor der Entscheidung 200–300 ml Wasser trinken." } },
  "EASY_fumar_36": { "es": { "title": "Respiración cuadrada", "description": "Inhala 4s, retén 4s, exhala 4s, retén 4s (4 ciclos)." }, "en": { "title": "Box breathing", "description": "Inhale 4s, hold 4s, exhale 4s, hold 4s (4 rounds)." }, "de": { "title": "Box-Atmung", "description": "4 Sek. ein, 4 halten, 4 aus, 4 halten (4 Runden)." } },
  "EASY_fumar_37": { "es": { "title": "Evita el disparador clave", "description": "Identifica un lugar/situación y evítalo hoy." }, "en": { "title": "Avoid one key trigger", "description": "Pick one location/situation and avoid it today." }, "de": { "title": "Einen Haupt-Trigger meiden", "description": "Einen Ort/eine Situation wählen und heute meiden." } },
  "EASY_fumar_38": { "es": { "title": "Cepíllate tras comer", "description": "Corta el impulso post-comida con higiene oral." }, "en": { "title": "Brush after meals", "description": "Break the post-meal craving with oral hygiene." }, "de": { "title": "Nach dem Essen Zähneputzen", "description": "Nach dem Essen putzen, um das Verlangen zu brechen." } },
  "EASY_fumar_39": { "es": { "title": "Manos ocupadas", "description": "Usa pelota antiestrés, bolígrafo o plastilina 5 minutos." }, "en": { "title": "Busy hands", "description": "Use a stress ball, pen or putty for 5 minutes." }, "de": { "title": "Beschäftigte Hände", "description": "5 Minuten Anti-Stress-Ball, Stift oder Knetmasse nutzen." } },
  "EASY_fumar_40": { "es": { "title": "Mini paseo consciente", "description": "Camina 5–10 min prestando atención a la respiración." }, "en": { "title": "Mini mindful walk", "description": "Walk 5–10 min while focusing on your breath." }, "de": { "title": "Achtsamer Mini-Spaziergang", "description": "5–10 Min. gehen und auf die Atmung achten." } },
  "EASY_fumar_41": { "es": { "title": "Café sin cigarro", "description": "Toma tu café en un lugar distinto y sin fumar." }, "en": { "title": "Coffee without a cigarette", "description": "Have coffee in a different spot and don’t smoke." }, "de": { "title": "Kaffee ohne Zigarette", "description": "Kaffee an einem anderen Ort und nicht rauchen." } },

  "EASY_fumar_42": {
  "es": { "title": "Reformula el pensamiento", "description": "De «lo necesito» a «la urgencia pasará en minutos»." },
  "en": { "title": "Reframe the thought", "description": "From \"I need it\" to \"this urge will pass in minutes.\""},
  "de": { "title": "Gedanken umdeuten", "description": "Von „Ich brauche es“ zu „Das Verlangen geht gleich vorbei.“" }
},
  "EASY_fumar_43": { "es": { "title": "Registra 1 antojo", "description": "Anota hora, intensidad (0–10) y qué te ayudó." }, "en": { "title": "Log one craving", "description": "Record time, intensity (0–10) and what helped." }, "de": { "title": "Ein Verlangen protokollieren", "description": "Zeit, Intensität (0–10) und hilfreiche Maßnahme notieren." } },
  "EASY_fumar_44": { "es": { "title": "Premio sin tabaco", "description": "Guarda el dinero de hoy y date una mini-recompensa." }, "en": { "title": "Smoke-free reward", "description": "Save today’s money and give yourself a mini reward." }, "de": { "title": "Rauchfreie Belohnung", "description": "Heutiges Geld sparen und eine Mini-Belohnung gönnen." } },
  "EASY_fumar_45": { "es": { "title": "Infusión en vez de cigarro", "description": "Sustituye un cigarro por una infusión caliente." }, "en": { "title": "Tea instead of a cigarette", "description": "Swap one cigarette for a warm herbal tea." }, "de": { "title": "Tee statt Zigarette", "description": "Eine Zigarette durch warmen Kräutertee ersetzen." } },
  "EASY_fumar_46": { "es": { "title": "Boca ocupada", "description": "Palitos de zanahoria o chicle sin azúcar 5 minutos." }, "en": { "title": "Mouth busy", "description": "Carrot sticks or sugar-free gum for 5 minutes." }, "de": { "title": "Mund beschäftigen", "description": "5 Min. Karottensticks oder zuckerfreien Kaugummi." } },
  "EASY_fumar_47": { "es": { "title": "Cambia el rincón de fumar", "description": "Evita el lugar habitual durante todo el día." }, "en": { "title": "Change your smoking spot", "description": "Avoid your usual place all day." }, "de": { "title": "Raucher-Ecke wechseln", "description": "Den üblichen Ort den ganzen Tag meiden." } },
  "EASY_fumar_48": { "es": { "title": "Plan de 2 minutos", "description": "Cuando te den ganas, haz 2 minutos de actividad física." }, "en": { "title": "2-minute plan", "description": "When you crave, do 2 minutes of movement." }, "de": { "title": "2-Minuten-Plan", "description": "Bei Verlangen 2 Minuten Bewegung machen." } },
  "EASY_fumar_49": { "es": { "title": "Respiración 4-7-8", "description": "Inhala 4s, retén 7s y exhala 8s, 4 ciclos." }, "en": { "title": "4-7-8 breathing", "description": "Inhale 4s, hold 7s, exhale 8s for 4 rounds." }, "de": { "title": "4-7-8-Atmung", "description": "4 Sek. ein, 7 halten, 8 aus – 4 Durchgänge." } },
  "EASY_fumar_50": { "es": { "title": "Lava tus manos", "description": "Agua tibia y jabón para reducir el impulso." }, "en": { "title": "Wash your hands", "description": "Warm water and soap to reduce the urge." }, "de": { "title": "Hände waschen", "description": "Mit warmem Wasser und Seife das Verlangen senken." } },
  "EASY_fumar_51": { "es": { "title": "Ancla visual", "description": "Coloca una nota “respiro primero” donde sueles fumar." }, "en": { "title": "Visual anchor", "description": "Place a “breathe first” note where you usually smoke." }, "de": { "title": "Visueller Anker", "description": "„Erst atmen“-Notiz am üblichen Rauchort platzieren." } },
  "EASY_fumar_52": { "es": { "title": "Ducha breve anti-estrés", "description": "Agua tibia 2–3 min para cortar la ansiedad." }, "en": { "title": "Quick anti-stress shower", "description": "Warm water 2–3 min to break anxiety." }, "de": { "title": "Kurzdusche gegen Stress", "description": "2–3 Min. warm duschen, um die Anspannung zu lösen." } },
  "EASY_fumar_53": { "es": { "title": "Llamada de apoyo", "description": "Envía un audio/mensaje a alguien de confianza." }, "en": { "title": "Support call", "description": "Send a voice note/message to a trusted person." }, "de": { "title": "Unterstützungs-Anruf", "description": "Sprachnachricht/Nachricht an eine Vertrauensperson schicken." } },
  "EASY_fumar_54": { "es": { "title": "Red social fuera", "description": "Toma 1 hora sin redes si disparan el impulso." }, "en": { "title": "Social media off", "description": "Take 1 hour off if it triggers cravings." }, "de": { "title": "Soziale Medien aus", "description": "1 Stunde pausieren, wenn es Verlangen auslöst." } },
  "EASY_fumar_55": { "es": { "title": "Nota de motivos visibles", "description": "Escribe 3 razones para dejarlo y pégalas a la vista." }, "en": { "title": "Visible reasons note", "description": "Write 3 reasons to quit and keep them visible." }, "de": { "title": "Sichtbare Gründe-Notiz", "description": "3 Gründe zum Aufhören schreiben und sichtbar platzieren." } },
  "EASY_fumar_56": { "es": { "title": "Respira por la nariz", "description": "Solo respiración nasal 3 minutos para calmarte." }, "en": { "title": "Nasal breathing only", "description": "Nose-only breathing for 3 minutes to calm down." }, "de": { "title": "Nur Nasenatmung", "description": "3 Minuten ausschließlich durch die Nase atmen." } },
  "EASY_fumar_57": { "es": { "title": "Recompensa simbólica", "description": "Marca un ✅ en tu calendario libre de humo." }, "en": { "title": "Symbolic reward", "description": "Add a ✅ to your smoke-free calendar." }, "de": { "title": "Symbolische Belohnung", "description": "Ein ✅ im rauchfreien Kalender setzen." } },
  "EASY_fumar_58": { "es": { "title": "Anda con un snack sano", "description": "Lleva frutos secos o fruta para los picos de ganas." }, "en": { "title": "Carry a healthy snack", "description": "Bring nuts or fruit for craving spikes." }, "de": { "title": "Gesunden Snack dabeihaben", "description": "Nüsse oder Obst für akute Phasen mitnehmen." } },
  "EASY_fumar_59": { "es": { "title": "Cambia de postura", "description": "Enderézate, abre el pecho y respira 1 minuto." }, "en": { "title": "Change your posture", "description": "Sit tall, open chest and breathe for 1 minute." }, "de": { "title": "Haltung ändern", "description": "Aufrichten, Brust öffnen und 1 Minute atmen." } },
  "EASY_fumar_60": { "es": { "title": "Visualiza pulmones limpios", "description": "Imagina tus pulmones sanos durante 2 minutos." }, "en": { "title": "Visualize clean lungs", "description": "Imagine your lungs healthy for 2 minutes." }, "de": { "title": "Saubere Lungen visualisieren", "description": "2 Minuten lang gesunde Lungen vorstellen." } },

// Mantenerse en forma (forma_1 a forma_30)
"EASY_forma_1": { "es": { "title": "Haz 20 sentadillas", "description": "20 sentadillas sin material. Espalda recta." }, "en": { "title": "Do 20 squats", "description": "20 bodyweight squats. Keep your back straight." }, "de": { "title": "Mache 20 Kniebeugen", "description": "20 Kniebeugen ohne Equipment. Rücken gerade halten." } },
"HARD_forma_2": { "es": { "title": "Camina 10,000 pasos", "description": "Suma pasos en casa o fuera hasta 10,000." }, "en": { "title": "Walk 10,000 steps", "description": "Accumulate steps at home or outside to reach 10,000." }, "de": { "title": "Gehe 10.000 Schritte", "description": "Zuhause oder draußen Schritte sammeln bis 10.000." } },
"MEDIUM_forma_3": { "es": { "title": "Escalón 10 minutos", "description": "Sube y baja un escalón o escalera 10 min." }, "en": { "title": "Step-ups 10 minutes", "description": "Go up and down a step or stairs for 10 min." }, "de": { "title": "Step-Ups 10 Minuten", "description": "10 Min. eine Stufe oder Treppe hoch und runter." } },
"MEDIUM_forma_4": { "es": { "title": "Haz 15 flexiones", "description": "Con rodillas apoyadas si lo necesitas." }, "en": { "title": "Do 15 push-ups", "description": "Knees on the floor if needed." }, "de": { "title": "Mache 15 Liegestütze", "description": "Bei Bedarf auf den Knien." } },
"EASY_forma_5": { "es": { "title": "Estira 10 minutos", "description": "Cuello, hombros y piernas con suavidad." }, "en": { "title": "Stretch 10 minutes", "description": "Gently stretch neck, shoulders, and legs." }, "de": { "title": "10 Minuten dehnen", "description": "Nacken, Schultern und Beine sanft dehnen." } },
"MEDIUM_forma_6": { "es": { "title": "Plancha 1 minuto", "description": "Mantén 60 s; descansa si hace falta." }, "en": { "title": "Plank 1 minute", "description": "Hold for 60s; rest if needed." }, "de": { "title": "Plank 1 Minute", "description": "60 Sek. halten; bei Bedarf pausieren." } },
"EASY_forma_7": { "es": { "title": "Baila 15 minutos", "description": "Pon música y muévete libre en casa." }, "en": { "title": "Dance 15 minutes", "description": "Play music and move freely at home." }, "de": { "title": "15 Minuten tanzen", "description": "Musik an und frei zu Hause bewegen." } },
"MEDIUM_forma_8": { "es": { "title": "Yoga 20 minutos", "description": "Clase corta en vídeo o rutina propia." }, "en": { "title": "Yoga 20 minutes", "description": "Follow a short video class or your own flow." }, "de": { "title": "Yoga 20 Minuten", "description": "Kurzes Video oder eigene Routine folgen." } },
"MEDIUM_forma_9": { "es": { "title": "Saltar cuerda 5 minutos", "description": "Sin cuerda, simula el movimiento." }, "en": { "title": "Jump rope 5 minutes", "description": "No rope? Simulate the motion." }, "de": { "title": "Seilspringen 5 Minuten", "description": "Ohne Seil die Bewegung simulieren." } },
"MEDIUM_forma_10": { "es": { "title": "30 abdominales", "description": "3×10 repeticiones con buena respiración." }, "en": { "title": "30 crunches", "description": "3×10 reps with good breathing." }, "de": { "title": "30 Crunches", "description": "3×10 Wiederholungen mit ruhiger Atmung." } },
"HARD_forma_11": { "es": { "title": "Trote 20 min en sitio", "description": "Trota en el lugar o pasillo 20 minutos." }, "en": { "title": "Jog in place 20 min", "description": "Jog in place or hallway for 20 minutes." }, "de": { "title": "20 Min. auf der Stelle joggen", "description": "20 Minuten auf der Stelle oder im Flur joggen." } },
"HARD_forma_12": { "es": { "title": "Burpees 3 minutos", "description": "Intervalos 30 s on / 15 s off." }, "en": { "title": "Burpees 3 minutes", "description": "Intervals 30s on / 15s off." }, "de": { "title": "Burpees 3 Minuten", "description": "Intervalle 30 Sek. an / 15 Sek. aus." } },
"EASY_forma_13": { "es": { "title": "Equilibrio a una pierna", "description": "3×30 s por pierna junto a una pared." }, "en": { "title": "Single-leg balance", "description": "3×30s per leg next to a wall." }, "de": { "title": "Einbein-Stand", "description": "3×30 Sek. pro Bein an der Wand." } },
"MEDIUM_forma_14": { "es": { "title": "20 zancadas", "description": "10 por pierna; añade peso con botellas." }, "en": { "title": "20 lunges", "description": "10 per leg; add bottle weights if you like." }, "de": { "title": "20 Ausfallschritte", "description": "10 pro Bein; mit Flaschen als Gewicht." } },
"HARD_forma_15": { "es": { "title": "Bajo impacto 30 min", "description": "Cardio suave en casa, sin saltos." }, "en": { "title": "Low-impact 30 min", "description": "Gentle at-home cardio, no jumping." }, "de": { "title": "Low-Impact 30 Min.", "description": "Sanftes Cardio zu Hause, ohne Springen." } },
"HARD_forma_16": { "es": { "title": "Bici o pedaleo 30 min", "description": "Bici estática o pedaleo simulado amplio." }, "en": { "title": "Bike or pedal 30 min", "description": "Stationary bike or simulated pedaling." }, "de": { "title": "Velo/Simulieren 30 Min.", "description": "Heimtrainer oder Pedalbewegung simulieren." } },
"MEDIUM_forma_17": { "es": { "title": "Circuito peso corporal", "description": "Sentadillas, flexiones y plancha 10–15 min." }, "en": { "title": "Bodyweight circuit", "description": "Squats, push-ups, plank for 10–15 min." }, "de": { "title": "Körpergewichts-Zirkel", "description": "Kniebeugen, Liegestütze, Plank 10–15 Min." } },
"HARD_forma_18": { "es": { "title": "Cardio en casa 45 min", "description": "Clase online de cardio o baile." }, "en": { "title": "At-home cardio 45 min", "description": "Online cardio or dance class." }, "de": { "title": "Cardio zu Hause 45 Min.", "description": "Online-Cardio oder Tanz-Workout." } },
"MEDIUM_forma_19": { "es": { "title": "Movilidad 10–15 min", "description": "Articulaciones: cuello, hombros, cadera, tobillos." }, "en": { "title": "Mobility 10–15 min", "description": "Joints: neck, shoulders, hips, ankles." }, "de": { "title": "Mobilität 10–15 Min.", "description": "Gelenke: Nacken, Schultern, Hüfte, Knöchel." } },
"EASY_forma_20": { "es": { "title": "Camina tras cada comida", "description": "5–10 min de paseo suave en casa." }, "en": { "title": "Walk after meals", "description": "Take a gentle 5–10 min walk at home." }, "de": { "title": "Nach dem Essen gehen", "description": "5–10 Min. sanft zu Hause umhergehen." } },
"EASY_forma_21": { "es": { "title": "Respiración diafragmática", "description": "Respira profundo 5–10 minutos." }, "en": { "title": "Diaphragmatic breathing", "description": "Deep breathing for 5–10 minutes." }, "de": { "title": "Zwerchfellatmung", "description": "5–10 Minuten tief atmen." } },
"MEDIUM_forma_22": { "es": { "title": "Tai chi 15 minutos", "description": "Sigue un vídeo corto en el salón." }, "en": { "title": "Tai chi 15 minutes", "description": "Follow a short video at home." }, "de": { "title": "Tai-Chi 15 Minuten", "description": "Kurzes Video im Wohnzimmer folgen." } },
"EASY_forma_23": { "es": { "title": "Jumping jacks 3–5 min", "description": "A ritmo suave en casa." }, "en": { "title": "Jumping jacks 3–5 min", "description": "Easy pace at home." }, "de": { "title": "Hampelmänner 3–5 Min.", "description": "In ruhigem Tempo zu Hause." } },
"EASY_forma_24": { "es": { "title": "Postura 10 minutos", "description": "Alinea cabeza, hombros y cadera frente al espejo." }, "en": { "title": "Posture 10 minutes", "description": "Align head, shoulders, hips in a mirror." }, "de": { "title": "Haltung 10 Minuten", "description": "Kopf, Schultern, Hüfte vor dem Spiegel ausrichten." } },
"MEDIUM_forma_25": { "es": { "title": "Espalda fuerte", "description": "Superman y remo con botellas 10–15 min." }, "en": { "title": "Stronger back", "description": "Superman + bottle rows for 10–15 min." }, "de": { "title": "Rücken stärken", "description": "Superman und Rudern mit Flaschen 10–15 Min." } },
"MEDIUM_forma_26": { "es": { "title": "Core 12–15 min", "description": "Plancha, dead bug y elevación pélvica." }, "en": { "title": "Core 12–15 min", "description": "Plank, dead bug, and hip raises." }, "de": { "title": "Core 12–15 Min.", "description": "Plank, Dead Bug und Hüftheben." } },
"HARD_forma_27": { "es": { "title": "HIIT 15 minutos", "description": "Tabata: 8×(20 s trabajo/10 s pausa)." }, "en": { "title": "HIIT 15 minutes", "description": "Tabata: 8×(20s work/10s rest)." }, "de": { "title": "HIIT 15 Minuten", "description": "Tabata: 8×(20 Sek. Arbeit/10 Sek. Pause)." } },
"EASY_forma_28": { "es": { "title": "Estira zona lumbar", "description": "5–10 min de estiramientos suaves." }, "en": { "title": "Lower back stretch", "description": "5–10 minutes of gentle stretches." }, "de": { "title": "Lendenbereich dehnen", "description": "5–10 Min. sanft dehnen." } },
"MEDIUM_forma_29": { "es": { "title": "Brazos con botellas", "description": "Tonifica brazos 12–15 min con botellas." }, "en": { "title": "Arms with bottles", "description": "Tone arms 12–15 min using bottles." }, "de": { "title": "Arme mit Flaschen", "description": "Arme 12–15 Min. mit Flaschen trainieren." } },
"HARD_forma_30": { "es": { "title": "Natur 45 minutos", "description": "Camina al aire libre o 30 min de cardio en casa." }, "en": { "title": "Nature walk 45 min", "description": "Walk outdoors or do 30 min cardio at home." }, "de": { "title": "Naturspaziergang 45 Min.", "description": "Draußen gehen oder 30 Min. Cardio zu Hause." } },

"EASY_forma_31": { "es": { "title": "Marcha en el sitio 2 min", "description": "Camina en el lugar con brazos activos durante 2 minutos." }, "en": { "title": "March in place 2 min", "description": "Walk on the spot with active arms for 2 minutes." }, "de": { "title": "Am Platz marschieren 2 Min", "description": "Am Ort gehen, Arme aktiv, 2 Minuten." } },
"EASY_forma_32": { "es": { "title": "Círculos de brazos 1 min", "description": "30 s hacia delante y 30 s hacia atrás." }, "en": { "title": "Arm circles 1 min", "description": "30 s forward and 30 s backward." }, "de": { "title": "Armkreisen 1 Min", "description": "30 s vorwärts und 30 s rückwärts." } },
"EASY_forma_33": { "es": { "title": "Talones a glúteos 1 min", "description": "Corre suave en el sitio llevando talones al glúteo." }, "en": { "title": "Butt kicks 1 min", "description": "Jog in place bringing heels to glutes." }, "de": { "title": "Fersen zum Gesäß 1 Min", "description": "Locker am Platz laufen, Fersen zum Po." } },
"EASY_forma_34": { "es": { "title": "Rodillas altas 1 min", "description": "Eleva rodillas al pecho a ritmo cómodo." }, "en": { "title": "High knees 1 min", "description": "Lift knees toward chest at an easy pace." }, "de": { "title": "Hohe Knie 1 Min", "description": "Im Stand Knie Richtung Brust anheben." } },
"EASY_forma_35": { "es": { "title": "Plancha 30 s", "description": "Mantén abdomen firme y cuerpo en línea." }, "en": { "title": "Plank 30 s", "description": "Hold a plank with tight core and straight line." }, "de": { "title": "Plank 30 s", "description": "Unterarmstütz mit festem Core, Körper in Linie." } },
"EASY_forma_36": { "es": { "title": "Plancha lateral 20 s por lado", "description": "Apoya antebrazo y mantén 20 s cada lado." }, "en": { "title": "Side plank 20 s each", "description": "Forearm on floor; hold 20 s per side." }, "de": { "title": "Seitstütz 20 s je Seite", "description": "Auf dem Unterarm 20 Sekunden pro Seite halten." } },
"EASY_forma_37": { "es": { "title": "Puente de glúteos 2×12", "description": "Acostado, eleva caderas: 2 series de 12." }, "en": { "title": "Glute bridge 2×12", "description": "Lying down, lift hips: 2 sets of 12." }, "de": { "title": "Glute Bridge 2×12", "description": "In Rückenlage Hüfte heben: 2 Sätze à 12." } },
"EASY_forma_38": { "es": { "title": "Bird-dog 2×8 por lado", "description": "Extiende brazo y pierna contraria en cuadrupedia." }, "en": { "title": "Bird-dog 2×8 per side", "description": "On all fours, extend opposite arm and leg." }, "de": { "title": "Bird-Dog 2×8 je Seite", "description": "Im Vierfüßler gegenüberliegenden Arm und Bein strecken." } },
"EASY_forma_39": { "es": { "title": "Elevación de gemelos 2×20", "description": "De puntillas sube y baja controlado: 2×20." }, "en": { "title": "Calf raises 2×20", "description": "Rise onto toes and lower with control: 2×20." }, "de": { "title": "Wadenheben 2×20", "description": "Auf die Zehen, kontrolliert absenken: 2×20." } },
"EASY_forma_40": { "es": { "title": "Zancadas alternas 2×10", "description": "Paso largo y bajada controlada: 2×10 por lado." }, "en": { "title": "Alternating lunges 2×10", "description": "Step long and lower with control: 2×10 each side." }, "de": { "title": "Ausfallschritte 2×10", "description": "Großer Schritt, kontrolliert senken: 2×10 je Seite." } },
"EASY_forma_41": { "es": { "title": "Jumping jacks 60 s", "description": "Hampelmänner a ritmo cómodo 60 s." }, "en": { "title": "Jumping jacks 60 s", "description": "Do jumping jacks at a comfortable pace for 60 s." }, "de": { "title": "Hampelmänner 60 s", "description": "60 Sekunden im lockeren Tempo." } },
"EASY_forma_42": { "es": { "title": "Bisagra de cadera 2×15", "description": "Good-mornings sin peso desde caderas." }, "en": { "title": "Hip hinge 2×15", "description": "Bodyweight good-mornings from the hips." }, "de": { "title": "Hüftbeuge 2×15", "description": "Good Mornings mit Körpergewicht." } },
"EASY_forma_43": { "es": { "title": "Rotaciones de tronco 1 min", "description": "De pie, rota suavemente el torso por 1 minuto." }, "en": { "title": "Torso rotations 1 min", "description": "Stand and rotate your torso gently for 1 minute." }, "de": { "title": "Rumpfrotationen 1 Min", "description": "Im Stand den Oberkörper sanft 1 Minute drehen." } },
"EASY_forma_44": { "es": { "title": "Estira cuello 2 min", "description": "Inclinaciones y giros suaves: 30 s por dirección." }, "en": { "title": "Neck stretch 2 min", "description": "Gentle tilts and turns: 30 s per direction." }, "de": { "title": "Nacken dehnen 2 Min", "description": "Sanft neigen und drehen: 30 s je Richtung." } },
"EASY_forma_45": { "es": { "title": "Movilidad de hombros 2 min", "description": "Cruces, elevaciones y apertura de pecho." }, "en": { "title": "Shoulder mobility 2 min", "description": "Cross-body, raises and chest opening." }, "de": { "title": "Schultermobilität 2 Min", "description": "Überkreuzen, heben und Brust öffnen." } },
"EASY_forma_46": { "es": { "title": "Apertura de cadera 2 min", "description": "Círculos y balanceos suaves de cadera." }, "en": { "title": "Hip opener 2 min", "description": "Gentle hip circles and swings." }, "de": { "title": "Hüftöffner 2 Min", "description": "Sanfte Hüftkreise und -schwünge." } },
"EASY_forma_47": { "es": { "title": "Estira isquios 2 min", "description": "Inclínate con espalda larga: 1 min por lado." }, "en": { "title": "Hamstring stretch 2 min", "description": "Hinge forward with long spine: 1 min per side." }, "de": { "title": "Ischios dehnen 2 Min", "description": "Mit langem Rücken vorbeugen: 1 Min je Seite." } },
"EASY_forma_48": { "es": { "title": "Toques a puntas 20 reps", "description": "Desde de pie, toca puntas o tibias 20 veces." }, "en": { "title": "Toe touches 20 reps", "description": "From standing, touch toes or shins 20 times." }, "de": { "title": "Zehenspitzen berühren 20 Wh", "description": "Im Stand Zehen oder Schienbein 20× berühren." } },
"EASY_forma_49": { "es": { "title": "Sentadilla isométrica 30 s", "description": "Baja a media sentadilla y mantén 30 s." }, "en": { "title": "Isometric squat 30 s", "description": "Lower to a half squat and hold for 30 s." }, "de": { "title": "Isometrische Kniebeuge 30 s", "description": "In halbe Kniebeuge gehen und 30 s halten." } },
"EASY_forma_50": { "es": { "title": "Patadas laterales 2×12", "description": "Eleva la pierna de lado con control: 2×12 por lado." }, "en": { "title": "Side leg raises 2×12", "description": "Lift the leg to the side with control: 2×12 each." }, "de": { "title": "Seitliches Beinheben 2×12", "description": "Bein seitlich kontrolliert heben: 2×12 je Seite." } },
"EASY_forma_51": { "es": { "title": "Círculos de cadera 1 min", "description": "Dibuja círculos amplios con la pelvis por 1 minuto." }, "en": { "title": "Hip circles 1 min", "description": "Draw big circles with your pelvis for 1 minute." }, "de": { "title": "Hüftkreisen 1 Min", "description": "Große Kreise mit dem Becken 1 Minute lang." } },
"EASY_forma_52": { "es": { "title": "Pasos laterales 2 min", "description": "Da pasos laterales continuos en poco espacio." }, "en": { "title": "Side steps 2 min", "description": "Take continuous side steps in a small space." }, "de": { "title": "Seitwärtsschritte 2 Min", "description": "Kontinuierliche Seitwärtsschritte auf kleinem Raum." } },
"EASY_forma_53": { "es": { "title": "Rodilla con giro 2×10", "description": "Eleva rodilla y gira torso hacia ella." }, "en": { "title": "Knee raise with twist 2×10", "description": "Lift knee and twist torso toward it." }, "de": { "title": "Knieheben mit Drehung 2×10", "description": "Knie heben und Oberkörper dorthin drehen." } },
"EASY_forma_54": { "es": { "title": "Equilibrio en puntas 60 s", "description": "Súbete a puntas y mantén el equilibrio 60 s." }, "en": { "title": "Tiptoe hold 60 s", "description": "Rise onto tiptoes and hold for 60 s." }, "de": { "title": "Zehenspitzen-Hold 60 s", "description": "Auf Zehenspitzen 60 Sekunden halten." } },
"EASY_forma_55": { "es": { "title": "Respira y camina 1 min", "description": "Inhala 4 pasos, exhala 6 pasos." }, "en": { "title": "Breathe & walk 1 min", "description": "Inhale for 4 steps, exhale for 6." }, "de": { "title": "Atmen & Gehen 1 Min", "description": "4 Schritte einatmen, 6 Schritte ausatmen." } },
"EASY_forma_56": { "es": { "title": "Tensión–relajación 1 min", "description": "Aprieta 5 s todo el cuerpo y suelta; repite." }, "en": { "title": "Tense–release 1 min", "description": "Tighten for 5 s, release; repeat." }, "de": { "title": "Anspannen–Lösen 1 Min", "description": "5 s anspannen, lösen; mehrmals wiederholen." } },
"EASY_forma_57": { "es": { "title": "Escápulas atrás 2×15", "description": "Junta omóplatos 2 s y suelta: 2×15." }, "en": { "title": "Scapular squeezes 2×15", "description": "Squeeze shoulder blades 2 s and release: 2×15." }, "de": { "title": "Schulterblatt-Squeeze 2×15", "description": "Schulterblätter 2 s zusammenziehen und lösen: 2×15." } },
"EASY_forma_58": { "es": { "title": "Círculos de tobillo 1 min", "description": "30 s por sentido en cada pie." }, "en": { "title": "Ankle circles 1 min", "description": "30 s each direction per foot." }, "de": { "title": "Fußgelenk-Kreise 1 Min", "description": "30 s je Richtung pro Fuß." } },
"EASY_forma_59": { "es": { "title": "Estira cuádriceps 45 s", "description": "Toma el empeine y acerca talón al glúteo." }, "en": { "title": "Quad stretch 45 s", "description": "Hold foot, heel to glute: 45 s per side." }, "de": { "title": "Quadrizeps-Dehnung 45 s", "description": "Fuß fassen, Ferse zum Gesäß: 45 s pro Seite." } },
"EASY_forma_60": { "es": { "title": "Respiraciones al sol 10 rep", "description": "Inhala subiendo brazos, exhala bajándolos (10 rep)." }, "en": { "title": "Sun breaths 10 reps", "description": "Inhale lifting arms, exhale lowering them (10 reps)." }, "de": { "title": "Sonnen-Atemzüge 10 Wh", "description": "Beim Einatmen Arme heben, beim Ausatmen senken (10 Wh)." } }


};

export const getTaskTranslation = (taskId: string, locale: string = 'es'): TaskTranslation | null => {
  const task = TASK_TRANSLATIONS[taskId];
  if (!task) return null;
  return task[locale] || task.es;
};
