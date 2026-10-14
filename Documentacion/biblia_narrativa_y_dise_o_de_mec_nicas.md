# Biblia de Diseño y Narrativa: "Sprint Cero"
**Género:** RPG de Simulación Laboral / Toma de Decisiones / Gestión de Tiempo y Habilidades Blandas

---

## 1. Investigación del Entorno: ¿Cómo funciona una empresa de Software Real?

El juego transcurre en **NovaSoft Solutions**, una consultora y fábrica de software de tamaño medio que está desarrollando **"FinTrack 2.0"**, una aplicación financiera crítica. Para que la simulación sea auténtica y educativa, toda la jugabilidad gira en torno a la metodología **Agile (Scrum + Kanban)**.

### Rituales y Conceptos de la Oficina que vivirá el Jugador:
1. **El Sprint (Ciclo de Juego):** La historia se divide en **3 Sprints** (3 actos). Cada Sprint representa una semana decisiva con un objetivo de entrega claro (*Sprint Goal*).
2. **El Tablero Kanban (To-Do, In Progress, Code Review, Done):** Las misiones no son simples recados; son *Tickets* o *User Stories* (Historias de Usuario) que deben pasar por desarrollo, revisión de código por un compañero y despliegue.
3. **La Daily Stand-up (Reunión diaria de 15 min):** Al inicio de cada día, el equipo se reúne de pie frente a la pizarra para responder tres preguntas: *¿Qué hice ayer? ¿Qué haré hoy? ¿Tengo algún bloqueo (impedimento)?* Aquí es donde se ponen a prueba la **Comunicación**, la **Coordinación** y la **Confianza**.
4. **Pull Requests (PR) y Code Review:** Ningún código va directo al producto final. Otro desarrollador debe revisarlo. Esto genera roces de ego, cuellos de botella y oportunidades de aplicar **Empatía**, **Asertividad** y **Complementariedad**.
5. **Deuda Técnica y "Scope Creep" (Inflación del Alcance):** Si haces el trabajo rápido y mal para cumplir el reloj sin coordinarte, generas *Deuda Técnica* (bugs futuros que explotan en el Acto 3). Además, los jefes intentarán meter tareas de última hora (*Scope Creep*), obligándote a **Negociar**.

---

## 2. Elenco de Personajes (NPCs)

Cada compañero de la oficina está diseñado para desafiar una habilidad blanda específica del jugador:

* **Tú (El/La Protagonista - Mid-Level Fullstack Developer):** Acabas de superar el periodo de prueba. Tienes potencial técnico, pero tu futuro en la empresa dependerá de cómo gestiones tu tiempo, tus emociones y a tus compañeros.
* **Elena (Scrum Master / Facilitadora):** Organizada, observadora y defensora de las metodologías ágiles. Valora la **Coordinación**, la transparencia en las reuniones y la puntualidad. Si ocultas problemas o rechazas trabajar en equipo, su confianza en ti cae en picado.
* **David (Product Owner / Director de Cuenta):** El puente entre el cliente y el equipo. Vive bajo presión comercial, promete plazos irreales y pide cambios constantes. Si eres pasivo, te aplastará con trabajo; si eres agresivo, te despedirá; si eres **asertivo y negociador**, te respetará.
* **Marcos (Senior Backend Developer - "El Lobo Solitario"):** Lleva 6 años en la empresa. Es un genio optimizando bases de datos, pero tiene poca paciencia, escribe comentarios hirientes en las revisiones de código y cree que "trabajar en equipo es perder el tiempo". Representa el reto de la **Complementariedad** y la **Gestión de Conflictos**.
* **Sofía (UX/UI Designer & Frontend):** Creativa, detallista y muy empática, pero tiende a dispersarse y sufre de ansiedad cuando hay gritos o tensiones. Necesita **Escucha Activa** y **Compromiso** para brillar.
* **Lucas (Junior Developer en prácticas):** Entusiasta pero inseguro. Tiene miedo de preguntar cuando se atasca por temor a parecer incompetente. Representa la **Confianza** psicológica del equipo.

---

## 3. Diseño de Sistemas Core y Mecánicas Psicológicas

### A. El Nivelador de Inteligencia Emocional ($IE$)
El jugador posee un medidor dinámico de **Inteligencia Emocional ($IE \in [0, 100]$)**, que comienza en **$50$ (Neutral)**. Se alimenta de cuatro pilares: *Autoconciencia* (reconocer tus propios pensamientos internos), *Autorregulación* (no responder en caliente), *Empatía* y *Habilidades Sociales*.

| Rango de $IE$ | Estado del Entorno | Efecto Dinámico en Diálogos y Jugabilidad |
| :--- | :--- | :--- |
| **$75 - 100$** | **Sinergia Empática (Recompensa)** | Los NPCs te saludan con calidez, te avisan espontáneamente de posibles *bugs* antes de que ocurran, aceptan tus propuestas en negociaciones con un $+25\%$ de facilidad y te cubren si tienes un imprevisto de tiempo. |
| **$35 - 74$** | **Clima Profesional (Estándar)** | Respuestas neutras y estrictamente laborales. Nadie te sabotea, pero nadie hace favores extra sin que lo negocies. |
| **$0 - 34$** | **Entorno Hostil / Frío (Castigo)** | Respuestas secas y cortantes (*"Ya te lo envié por correo"*, *"Resuélvelo tú"*). Marcos rechaza tus *Pull Requests* por detalles mínimos, Lucas te oculta sus errores por miedo y David te vigila de cerca, aumentando la dificultad de todas las negociaciones. |

### B. El Sistema de Trabajo en Equipo: Las 5 C + Ventajas e Inconvenientes
El juego no idealiza el trabajo en equipo de forma ingenua: muestra **sus ventajas y sus inconvenientes reales** a través de un sistema de **Monólogos Internos** y costes de tiempo.

* **El Dilema constante (Individualismo vs. Colectivo):**
  * *Inconveniente del trabajo en equipo:* Coordinarse, asistir a reuniones o hacer *Pair Programming* (programar entre dos) consume entre un **$15\%$ y un $25\%$ más de tiempo inmediato** de tu reloj diario y puede generar choques de criterio.
  * *Ventaja del trabajo en equipo:* Reduce la tasa de errores (*bugs*) en un **$70\%$**, desbloquea soluciones que tú solo no sabrías programar y sube tu reputación con Elena y David.
  * *Consecuencia de rechazar el equipo:* Si decides aislarte ("Yo hago mi parte y que el resto se arregle"), al principio terminarás tus tareas rápido, pero generarás código incompatible con el de Sofía y Marcos, provocando el enfado de Elena y una penalización grave con el jefe en la revisión del Sprint.

#### Las 5 Métricas del Equipo (0 a 100 cada una):
1. **Compromiso ($C_1$):** Poner el éxito del proyecto común por encima de lucirse individualmente o escaquearse cuando algo falla.
2. **Confianza ($C_2$):** Crear seguridad psicológica. Confiar en que el compañero hará su parte y permitir que Lucas o Sofía admitan un error sin humillarlos.
3. **Coordinación ($C_3$):** Sincronizar quién hace qué y en qué orden para no pisarse el código ni duplicar esfuerzos.
4. **Comunicación ($C_4$):** Transmitir información clara, a tiempo y sin ambigüedades (evitar el *"pensé que tú sabías que había cambiado la API"*).
5. **Complementariedad ($C_5$):** Reconocer que no lo sabes todo. Apoyarte en la habilidad de bases de datos de Marcos y en el diseño de Sofía para lograr un producto superior.

### C. Organización, Gestión del Tiempo y Procrastinación
Cada misión o *Sprint* tiene un **Temporizador Real en Pantalla** (ej. 8 minutos de tiempo real equivalen a las 8 horas de la jornada en la oficina).

#### El Ciclo de Procrastinación y el Despido:
En la oficina hay **tentaciones interactivas**: el teléfono móvil con notificaciones, la máquina de café con charlas interminables, el futbolín/ping-pong o ponerse a refactorizar código irrelevante por perfeccionismo.
* Si el temporizador de una tarea llega a $00:00$ sin haberse entregado:
  * **1ª Falta (Strike 1 - Advertencia):** Reunión incómoda en la Daily. Baja la *Confianza ($C_2$)* y el *Compromiso ($C_1$)* en $-15$ puntos.
  * **2ª Falta (Strike 2 - Plan de Mejora / Micromanagement):** David (el jefe) se sienta cerca de tu mesa. Pierdes autonomía, tu estrés sube y recibes un ultimátum formal.
  * **3ª Falta (Strike 3 - Umbral de Despido):** **GAME OVER**. Recursos Humanos y David te convocan a la sala de cristal por incumplimiento reiterado e incapacidad de autogestión.

#### Árbol de Estrategias Desbloqueables (Recompensas por Puntualidad):
Al completar tareas dentro del tiempo límite, el jugador gana puntos de **"Maestría Temporal"** que desbloquean 4 herramientas jugables en su ordenador de la oficina:

1. **Nivel 1: Técnica Pomodoro (El Reloj de Tomate):**
   * *Mecánica:* Activa ciclos de enfoque profundo ($25\text{ min}$ simulados de trabajo + $5\text{ min}$ de pausa). Mientras está activo, las distracciones de la oficina (notificaciones del móvil, interrupciones triviales) quedan bloqueadas y tu velocidad de codificación sube un $+30\%$, evitando el agotamiento mental.
2. **Nivel 2: Matriz de Eisenhower (El Clasificador Estratégico):**
   * *Mecánica:* Cuando te llegan 6 tareas de golpe, abre una cuadrícula interactiva de $2 \times 2$ (*Urgente vs. Importante*):
     * **Cuadrante 1 (Urgente e Importante):** *Hacer ahora* (ej. Bug crítico en pasarela de pagos).
     * **Cuadrante 2 (No Urgente pero Importante):** *Planificar* (ej. Arquitectura del módulo de seguridad).
     * **Cuadrante 3 (Urgente pero No Importante):** *Delegar* (ej. Rellenar un informe rutinario o configurar un entorno de pruebas $\rightarrow$ te permite asignárselo a Lucas con buen tacto).
     * **Cuadrante 4 (Ni Urgente ni Importante):** *Eliminar/Posponer* (ej. Cambiar el color de un botón interno que nadie usa o asistir a una reunión sin agenda).
3. **Nivel 3: Ley de Pareto (El Escáner 80/20):**
   * *Mecánica:* Basado en el principio de que el $80\%$ de los resultados proviene del $20\%$ del esfuerzo. Al activarlo sobre una misión compleja, el sistema resalta cuál de las 5 subtareas técnicas aporta el valor real al cliente. Te permite entregar un Producto Mínimo Viable (MVP) impecable en la mitad de tiempo sin caer en el perfeccionismo inútil.
4. **Nivel 4: Diagrama de Gantt Interactivo (Visión de Arquitecto):**
   * *Mecánica:* Desbloquea en tu monitor el cronograma global de toda la oficina con barras de dependencia. Te permite ver que *Sofía no podrá empezar su pantalla mañana si tú no terminas el endpoint de la API hoy a las 14:00*. Hacer clic en las barras de dependencia te otorga bonificaciones masivas en **Coordinación ($C_3$)** y **Complementariedad ($C_5$)**.

---

## 4. Historia Completa Ramificada (Los 3 Actos)

---

### ACTO 1: El Sprint de Bienvenida y el Dilema del Ego
**Contexto:** Lunes, 9:00 AM. Comienza el Sprint 1. El objetivo es desarrollar el nuevo módulo de autenticación y panel de usuario de *FinTrack 2.0*.

#### Escena 1.1: La Daily Stand-up y la Petición de Ayuda
Te acercas a la pizarra Scrum donde están Elena, Marcos, Sofía y Lucas.
* **Elena (Scrum Master):** *"Buenos días, equipo. Tenemos 5 días para cerrar el módulo de acceso. Lucas, veo que tu tarea de conectar el formulario de registro lleva atascada desde el viernes. ¿Qué ocurre?"*
* **Lucas (Junior Dev):** *(Mira al suelo, nervioso)* *"Bueno... es que la validación de tokens me da un error extraño. Intenté mirarlo el fin de semana, pero no doy con la tecla..."*
* **Marcos (Senior Dev):** *(Suspira mirando su reloj)* *"Eso se hace en veinte minutos si sabes leer la documentación. Yo tengo que optimizar las consultas SQL, no puedo hacer de niñera."*
* **Elena:** *(Te mira a ti)* *"Tú tienes asignada la pasarela de datos, que conecta con lo de Lucas. ¿Cómo quieres enfocarlo hoy?"*

> **💭 PENSAMIENTO INTERNO DEL PROTAGONISTA:**
> *"Si me siento con Lucas a hacer Pair Programming (trabajar en equipo), perderé al menos 2 horas de mi mañana explicándole cómo funciona y mi propio temporizador irá más justo (Inconveniente). Pero si lo dejo solo o lo hago yo por mi cuenta ignorándolo, su código y el mío no encajarán mañana y el ambiente se volverá tenso (Ventaja de colaborar vs Riesgo individual)."*

**Opciones de Diálogo y Acción:**

* **Opción A (Rechazo del trabajo en equipo / Individualista):**
  *"Cada uno tiene sus tickets asignados, Elena. Yo voy a encerrarme con mi parte para terminarla rápido; cuando Lucas acabe la suya como pueda, ya veremos cómo lo unimos."*
  * **Efecto en Métricas:** Tiempo propio $+20\%$ (ahorro inmediato), Compromiso ($C_1$) $-20$, Confianza ($C_2$) $-15$, Inteligencia Emocional ($IE$) $-10$.
  * **Consecuencia Narrativa:** Elena frunce el ceño (*"En Scrum el éxito se mide por el equipo, no por tickets aislados"*). Al final del día, Lucas entrega un código incompatible con el tuyo. Tienes que rehacer el trabajo el martes con el doble de estrés.

* **Opción B (Falsa ayuda / Paternalismo agresivo):**
  *"Quita, Lucas, pásame tu rama de código que lo programo yo en media hora para que no nos retrases a todos."*
  * **Efecto en Métricas:** Tiempo propio $-10\%$, Confianza ($C_2$) $-25$, Complementariedad ($C_5$) $-20$, $IE$ $-15$.
  * **Consecuencia Narrativa:** Humillas a Lucas frente al equipo. El problema técnico se resuelve hoy, pero Lucas dejará de hablarte y en el Acto 2 no te avisará cuando detecte un fallo en tu código.

* **Opción C (Escucha Activa + Trabajo en Equipo equilibrado - Las 5 C):**
  *"Entiendo que te hayas bloqueado, Lucas; esa librería de tokens es confusa al principio (Empatía). Como mi tarea depende de la tuya, dediquemos 45 minutos ahora a revisarlo juntos (Coordinación y Compromiso) y así dejamos definido el contrato de datos para los dos."*
  * **Efecto en Métricas:** Tiempo propio $-15\%$ (coste real de tiempo inicial), Confianza ($C_2$) $+20$, Coordinación ($C_3$) $+20$, Comunicación ($C_4$) $+15$, $IE$ $+15$.
  * **Consecuencia Narrativa:** Elena sonríe y toma nota positiva. Lucas aprende el patrón, se motiva y a mitad del Sprint te devuelve el favor automatizando tus pruebas unitarias, recuperando con creces el tiempo invertido. **Desbloqueas la Técnica Pomodoro** al completar tu bloque de código posterior a tiempo.

---

#### Escena 1.2: El Choque de Complementariedad con Marcos (Code Review)
Son las 15:30. Has terminado tu código y subes una *Pull Request* para que Marcos (Senior) la revise antes de integrarla. Caminas hacia su mesa. Marcos te ha dejado un comentario en el sistema: *"Este código es ineficiente. Rehacer."* Sin más explicaciones.

* **Variación del saludo de Marcos según tu umbral de $IE$ actual:**
  * *Si tu $IE \ge 60$:* *"Hola. He visto tu subida. Funciona, pero esa consulta va a ir lenta cuando tengamos diez mil usuarios."*
  * *Si tu $IE < 40$:* *(Ni siquiera despega la vista del monitor)* *"¿Qué quieres? Ya te puse en el comentario que está mal."*

**Opciones de Respuesta (Técnicas de Comunicación y Complementariedad):**

* **Opción A (Comunicación Agresiva / Choque de egos):**
  *"¡Mi código pasa todos los tests! Tú siempre rechazas todo porque quieres que se haga a tu manera. ¡Deja de bloquear mis entregas!"*
  * **Efecto:** $IE$ $-20$, Comunicación ($C_4$) $-20$, Complementariedad ($C_5$) $-25$. Se genera el estado **"Conflicto Abierto con Backend"**.

* **Opción B (Comunicación Pasiva / Sumisión sin aprendizaje):**
  *"Vale, perdón... Ahora mismo borro todo y trato de adivinar cómo quieres que lo ponga, aunque me quede hasta las diez de la noche."*
  * **Efecto:** $IE$ $-5$, Tiempo $-30\%$ (riesgo alto de **Strike de Procrastinación/Retraso**), Comunicación ($C_4$) $-10$.

* **Opción C (Comunicación Asertiva + Escucha Activa + Complementariedad):**
  *"Marcos, valoro tu experiencia en bases de datos porque sé que ves cuellos de botella que a mí se me escapan (Complementariedad). Sin embargo, un comentario que solo dice 'Rehacer' no me da contexto para corregirlo rápido (Asertividad). ¿Me muestras en 5 minutos qué índice cambiarías para que ambos ahorremos tiempo?"*
  * **Efecto:** $IE$ $+20$, Complementariedad ($C_5$) $+25$, Comunicación ($C_4$) $+20$, Confianza ($C_2$) $+15$.
  * **Consecuencia Narrativa:** Marcos se sorprende por tu madurez, baja la guardia y te enseña un truco avanzado de optimización. A partir de ahora, tus revisiones de código con él tardan la mitad de tiempo.

---

### ACTO 2: Tormenta a Mitad de Proyecto ("Scope Creep" y Conflictos)
**Contexto:** Miércoles del Sprint 2. El reloj aprieta. Si cumpliste tus tiempos en el Acto 1, ahora tienes activa la **Matriz de Eisenhower** y la **Ley de Pareto (80/20)** en tu ordenador.

#### Escena 2.1: La Intrusión del Jefe (Negociación de Alcance y Tiempo)
David (Product Owner / Jefe Comercial) entra apresurado a tu zona de trabajo con una taza de café en la mano.

* **David:** *"¡Escucha! Acabo de salir de una llamada con el Director del Banco cliente. Quieren que para la demo de este viernes incluyamos un sistema de exportación a PDF con gráficos animados. Y además, el departamento de marketing me pide que cambies las fuentes de la web interna y me prepares una presentación de 20 diapositivas sobre la arquitectura. ¡Todo es prioridad máxima! Contamos contigo, ¿verdad?"*

> **💭 PENSAMIENTO INTERNO DEL PROTAGONISTA:**
> *"Mi temporizador del Sprint está al $70\%$ de capacidad con las tareas críticas actuales. Si digo que sí a todo sin negociar, es matemáticamente imposible terminar a tiempo: caeré en bloqueo, procrastinaré por ansiedad y recibiré un Strike grave de cara al despido. Si me niego en redondo diciendo que no es mi problema, David pensará que no tengo compromiso con la empresa."*

**Mecánica Interactiva en Pantalla:**
Antes de responder, el jugador puede abrir su **Matriz de Eisenhower** y analizar las peticiones de David:
1. *Seguridad de Transacciones (Tarea actual):* **Urgente + Importante (Hacer)**.
2. *Exportación PDF para Demo del Cliente:* **Importante (Negociable mediante Pareto 80/20)**.
3. *Presentación de 20 diapositivas técnicas:* **Urgente + No Importante para tu rol (Delegar / Compartir con Elena)**.
4. *Cambiar fuentes de la web interna:* **No Urgente + No Importante (Descartar/Posponer al siguiente Sprint)**.

**Opciones de Negociación con David:**

* **Opción A (El "Sí a todo" complaciente - Sin gestión de tiempo):**
  *"Claro, David, no te preocupes. Yo me encargo de las tres cosas además de mis tareas actuales. Ya veré cómo saco tiempo."*
  * **Efecto:** Compromiso aparente inicial $+5$, pero tu barra de tareas se desborda un $+180\%$. El temporizador se vuelve rojo. Es casi seguro que fallarás al menos dos entregas al final del día $\rightarrow$ **Recibes +2 Strikes de Incumplimiento/Procrastinación** y David se enfada el viernes: *"¡Me prometiste que llegabas!"*.

* **Opción B (Confrontación Rígida - Negativa sin alternativas):**
  *"Imposible, David. El Sprint está cerrado según las reglas de Scrum. No voy a tocar ni una línea de código extra porque tú le hayas prometido humos al cliente."*
  * **Efecto:** Tiempo intacto, pero $IE$ $-20$, Compromiso ($C_1$) $-20$. David se siente atacado y la relación con dirección queda dañada (Dificultad de negociación futura sube a **Extrema**).

* **Opción C (Negociación Integrativa + Asertividad + Pareto y Eisenhower):**
  *"Entiendo que impresionar al banco este viernes es clave para cerrar el contrato, David (Empatía/Escucha Activa). Ahora mismo mi tiempo está al $100\%$ con el motor de pagos. Si metemos todo esto sin ajustar nada, pondremos en riesgo la estabilidad de la demo (Asertividad). Te propongo este trato:
  1) Aplicando la **Ley de Pareto (80/20)**, puedo crear una exportación de datos limpia en CSV y un resumen visual rápido que nos da el $80\%$ del impacto visual para el cliente en solo el $20\%$ del tiempo de un generador PDF completo.
  2) Pospongamos el cambio de fuentes internas para el Sprint 3 (**Eisenhower: No urgente**).
  3) Y que Elena nos ayude con las diapositivas de arquitectura (**Delegación/Coordinación**). ¿Cerramos este acuerdo?"*
  * **Efecto:** $IE$ $+25$, Comunicación ($C_4$) $+25$, Coordinación ($C_3$) $+20$, Compromiso ($C_1$) $+15$.
  * **Consecuencia Narrativa:** David se queda impresionado: *"Así se habla. Me das una solución comercial sin romper el calendario. Trato hecho"*. **Desbloqueas el Diagrama de Gantt Interactivo**.

---

#### Escena 2.2: Guerra Civil en la Sala de Reuniones (Diseño vs. Backend)
Al pasar por la sala de reuniones, escuchas voces elevadas. Sofía (Diseño/Frontend) y Marcos (Backend) están discutiendo acaloradamente. Elena está en otra llamada y no puede intervenir. Decides entrar.

* **Sofía:** *(Al borde de las lágrimas de frustración)* *"¡Marcos, has cambiado la estructura de los datos sin avisarme! ¡Llevo dos días maquetando el panel de gastos y ahora toda mi pantalla da error en blanco! ¡No tienes ningún respeto por mi trabajo!"*
* **Marcos:** *"¡Tu diseño pedía cargar 50 gráficos a la vez, Sofía! ¡Eso colapsaba el servidor! Lo cambié porque técnicamente era una locura. Si supieras cómo funciona una base de datos no diseñarías cosas imposibles."*

> **Nota de Escalado Dinámico de Complejidad:**
> * **Si tu $IE$ y tus 5 C son altas ($\ge 65$):** Ambos se callan al verte entrar y te piden opinión como mediador respetado.
> * **Si tu $IE$ es baja ($< 40$) o tienes un conflicto previo con Marcos:** Ambos te miran con hostilidad (*"¿Y tú qué miras? ¡Esto también es culpa tuya por no coordinar la API!"*). Tendrás que superar un paso previo de **Autorregulación Emocional** antes de que te escuchen.

**Opciones de Mediación y Gestión del Conflicto:**

* **Opción A (Evitación / Huida):**
  *"Uy, perdón, solo venía a por un rotulador. Arregladlo entre vosotros, que yo tengo prisa con mi código."*
  * **Efecto:** Compromiso ($C_1$) $-25$, Coordinación ($C_3$) $-30$. El conflicto se enquista: Sofía pide la baja por estrés el jueves y el proyecto pierde el diseño frontal.

* **Opción B (Tomar partido / Alimentar la culpa):**
  *Darle la razón solo a Sofía atacando a Marcos, o darle la razón a Marcos ridiculizando el diseño de Sofía.*
  * **Efecto:** Rompes la **Confianza ($C_2$)** y la **Complementariedad ($C_5$)** en $-30$ puntos con uno de los dos miembros clave.

* **Opción C (Mediación por Escucha Activa, Reformulación y las 5 C):**
  *"Paremos un segundo, por favor. Escuchándoos a los dos, veo que ambos buscáis que la app sea excelente: Sofía quiere que el usuario tenga una experiencia visual increíble, y Marcos quiere que el servidor no se caiga y responda al instante (Reformulación + Empatía + Complementariedad $C_5$). El fallo no es técnico ni de diseño, ha sido de **Comunicación ($C_4$)** y **Coordinación ($C_3$)** al no avisar del cambio en la API.
  Miremos el **Diagrama de Gantt**: si Marcos añade un parámetro de carga paginada (1 hora) y Sofía muestra los primeros 5 gráficos con carga progresiva, mantenemos tu diseño intacto, Sofía, y protegemos el rendimiento de tu servidor, Marcos. ¿Qué os parece?"*
  * **Efecto:** $IE$ $+25$, Confianza ($C_2$) $+25$, Coordinación ($C_3$) $+25$, Comunicación ($C_4$) $+25$, Complementariedad ($C_5$) $+25$.
  * **Consecuencia Narrativa:** El ambiente se transforma por completo. Sofía y Marcos se piden disculpas mutuamente y trabajan codo con codo contigo. El equipo alcanza el estado de **"Alto Rendimiento"**.

---

### ACTO 3: Viernes de Despliegue a Producción (El Clímax)
**Contexto:** Viernes, 16:00 PM. Quedan 2 horas para la entrega final de *FinTrack 2.0* al cliente. De repente, las pantallas de monitorización de la oficina parpadean en rojo: **Caída crítica en el servidor de pre-producción**.

#### Escena 3.1: La Crisis del "Viernes Negro" y las 5 C al Límite
David entra en pánico en medio de la oficina:
* **David:** *"¡El cliente entra a ver la aplicación en 90 minutos y el sistema no carga! ¿¡Quién ha subido el último cambio que ha roto la base de datos!?"*
Mirando el historial de Git en tu pantalla, descubres la verdad: fue un *commit* de **Lucas (el Junior)** mezclado con una configuración tuya que no estaba documentada.

**La Decisión Definitiva de Liderazgo:**

* **Opción A (Chivo Expiatorio / Traicionar las 5 C):**
  *"Ha sido el código que subió Lucas hace diez minutos, David. Está en el registro de Git. Yo mi parte la dejé bien."*
  * **Efecto:** Destruyes la **Confianza ($C_2 = 0$)** y el **Compromiso ($C_1 = 0$)**. Elena y Sofía te miran con decepción profunda. Nadie te ayuda a arreglar el servidor y tienes que repararlo en solitario contra reloj.

* **Opción B (Asunción de Responsabilidad Compartida + Movilización de las 5 C):**
  *"David, buscar culpables ahora nos quita tiempo de resolución (Asertividad). El fallo ha ocurrido al integrarse el módulo de Lucas con mi configuración; la responsabilidad es del equipo y mía por no documentar ese paso (**Compromiso $C_1$ y Confianza $C_2$**).
  Tenemos 60 minutos y un plan claro (**Coordinación $C_3$**):
  - Marcos, ¿puedes revertir la migración de base de datos en el servidor? (**Complementariedad $C_5$**).
  - Sofía y Lucas, verificad la interfaz mientras yo aplico el parche en el controlador con un bloque **Pomodoro** de máxima concentración.
  - Elena, mantén la **Comunicación ($C_4$)** con David cada 15 minutos para que tenga tranquilidad con el cliente. ¡Vamos!"*

---

## 5. Resolución y los 6 Finales Posibles del Juego

Al terminar el Acto 3 (o antes, si se alcanza el límite de penalizaciones), el juego evalúa las variables acumuladas en el estado global y presenta uno de los **6 Finales Cinemáticos**:

### ❌ Final 1: Despido por Incompetencia y Procrastinación (Game Over Prematuro)
* **Condición:** Acumular $3\text{ Strikes}$ de tareas vencidas por pasar demasiado tiempo en distracciones o por no usar ninguna estrategia de gestión del tiempo (Pomodoro, Eisenhower, Pareto, Gantt).
* **Escena:** David y la directora de Recursos Humanos te entregan la caja de cartón para recoger las cosas de tu mesa. *"Tienes conocimientos técnicos, pero en una empresa de software no podemos depender de alguien que incumple sistemáticamente los plazos y bloquea al resto."*

### 🥀 Final 2: El "Lobo Solitario" Quemado (Burnout y Aislamiento)
* **Condición:** Entregar todas las tareas a tiempo ($\text{Strikes} = 0$), pero rechazar sistemáticamente el trabajo en equipo (Media de las **5 C** $< 35$) y tener la **Inteligencia Emocional** baja ($IE < 35$).
* **Escena:** El producto sale a tiempo porque trabajaste el doble en solitario, pero nadie en la oficina quiere volver a ser asignado a tu equipo. Tus compañeros celebran el cierre del proyecto en la cafetería sin invitarte. Terminas solo frente al monitor a las 21:00, agotado mentalmente y buscando ofertas en otro lugar porque el ambiente laboral se ha vuelto insoportable.

### 😰 Final 3: El Complaciente Explotado (Síndrome del Impostor / Sin Asertividad)
* **Condición:** Empatía alta, pero **Asertividad nula** y **Fracaso en las Negociaciones** con el jefe (aceptar todo el *Scope Creep* en el Acto 2 sin usar la Matriz de Eisenhower ni Pareto).
* **Escena:** Todo el mundo dice que eres "muy buena persona", pero David se ha acostumbrado a cargarte con el trabajo urgente de toda la oficina a última hora. No te ascienden porque no te ven con carácter de liderazgo, y pasas tus fines de semana apagando fuegos ajenos.

### 🤝 Final 4: Desarrollador Sólido (El Superviviente Equilibrado)
* **Condición:** Métricas medias ($40 \le IE < 75$ y media de las **5 C** entre $45$ y $74$), entregas cumplidas con al menos 2 herramientas de tiempo desbloqueadas.
* **Escena:** Superas la evaluación semestral con buena nota. El proyecto *FinTrack 2.0* es estable, tienes una relación cordial con Marcos, Sofía y Lucas, y recibes un aumento salarial estándar del $8\%$. Un buen profesional en crecimiento.

### 🏆 Final 5: Ascenso a Tech Lead / Líder de Ingeniería (Final Verdadero de Excelencia)
* **Condición:** Inteligencia Emocional sobresaliente ($IE \ge 75$), dominio de las **5 C** (todas $\ge 75$), uso de las 4 herramientas de gestión del tiempo (**Pomodoro, Pareto, Eisenhower y Gantt**) y resolución asertiva/integrativa en los conflictos de los Actos 2 y 3.
* **Escena:** La demo del viernes es un éxito rotundo.En la *Sprint Retrospective*, tanto Marcos (que antes no respetaba a nadie) como Sofía, Lucas y Elena destacan ante la directiva que tu capacidad para unir al equipo, escuchar activamente, negociar plazos realistas y organizar las prioridades salvó el proyecto. David te anuncia la creación de una nueva célula de desarrollo y tu ascenso inmediato a **Tech Lead**, con libertad para diseñar la cultura de tu propio equipo.

### 🚀 Final 6: La Chispa Emprendedora (Final Secreto: "Co-Fundadores")
* **Condición:** Alcanzar $90+$ en las **5 C** (especialmente en *Confianza*, *Compromiso* y *Complementariedad*) pero haber mantenido una postura firme y brillante frente a las malas prácticas comerciales de David en todas las negociaciones.
* **Escena:** La cohesión entre tú, Marcos (el cerebro de backend), Sofía (la visionaria de UX) y Lucas (ya convertido en un desarrollador seguro gracias a tu mentoría) es tan extraordinaria que os dais cuenta de que juntos formáis un equipo imbatible. Tras entregar con honor el proyecto en NovaSoft, os reunís fuera de la oficina con un Diagrama de Gantt en una pizarra propia: habéis conseguido financiación semilla para fundar vuestra propia *Startup* tecnológica donde la eficiencia ágil y la calidad humana van de la mano.

---

## 6. Tabla Resumen de Fórmulas para Programar con la IA

Para que la IA que programe el juego pueda traducir la historia en código matemático directo dentro de `useGameStore.ts`, utiliza estas reglas lógicas:

1. **Índice Global de Cohesión de Equipo ($ICE$):**
   $$ICE = \frac{C_{\text{Compromiso}} + C_{\text{Confianza}} + C_{\text{Coordinacion}} + C_{\text{Comunicacion}} + C_{\text{Complementariedad}}}{5}$$

2. **Multiplicador de Velocidad de Desarrollo del Equipo ($V_{\text{equipo}}$):**
   $$V_{\text{equipo}} = 1 + \left(\frac{ICE - 50}{100}\right) \times 0.5$$
   *(Explicación: Si el jugador ignora el trabajo en equipo y el $ICE$ cae a $20$, las tareas conjuntas tardan un $15\%$ más por fricción e incompatibilidad. Si el $ICE$ sube a $90$, el equipo trabaja un $20\%$ más rápido gracias a la sinergia).*

3. **Modificador de Éxito en Negociaciones ($P_{\text{negociacion}}$):**
   $$P_{\text{negociacion}} = \text{Base}_{\text{opcion}} + (0.3 \times IE) + (0.2 \times C_{\text{Comunicacion}}) + \text{Bonus}_{\text{Herramientas}}$$
   *(Explicación: Usar argumentos respaldados por la Matriz de Eisenhower, la Ley de Pareto o el Diagrama de Gantt añade un $\text{Bonus}_{\text{Herramientas}} = +25$, permitiendo ganar negociaciones difíciles ante el jefe sin perder Inteligencia Emocional).*