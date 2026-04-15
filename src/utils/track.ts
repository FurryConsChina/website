export function sendTrack({ eventName, eventValue }: { eventName: string; eventValue: { [key: string]: unknown } }) {
  if (process.env.NODE_ENV !== "production") {
    return console.info("Send Track", eventName, eventValue);
  }
  window.gtag?.("event", eventName, eventValue);
  window.umami?.track(eventName, eventValue);
}
