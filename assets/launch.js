/**
 * Lanzamiento de apps en Android / Fully Kiosk.
 *
 * Paquetes confirmados (Avaya Vantage):
 * - Teams: com.microsoft.teams
 * - Marcador: com.avaya.android.vantage.basic
 *
 * teamsPackages: orden de fully.startApplication si los intents no bastan.
 * teamsDeepLinks: msteams://, ms-teams://, etc.
 * dialerPackage: marcador Avaya (tras intents DIAL/VIEW y tel:).
 * dialerPackages: otros packages de marcador a probar después (opcional).
 *
 * En Fully suele hacer falta:
 * - Enable JavaScript Interface
 * - Open Other URL Schemes (intent:, tel:, msteams:, …)
 */
window.KENER_LAUNCH = {
  teamsPackages: ["com.microsoft.teams"],
  teamsDeepLinks: ["msteams://", "ms-teams://"],
  dialerPackage: "com.avaya.android.vantage.basic",
  dialerPackages: [],
};
