function field(id: string, value: string) {
  return id + value.length.toString().padStart(2, "0") + value;
}

function normalize(text: string, maxLength: number) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .slice(0, maxLength);
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

interface PixPayloadParams {
  key: string;
  name: string;
  city: string;
  amount?: number;
}

export function buildPixPayload({ key, name, city, amount }: PixPayloadParams) {
  const merchantAccount = field("00", "br.gov.bcb.pix") + field("01", key);

  const payload =
    field("00", "01") +
    field("26", merchantAccount) +
    field("52", "0000") +
    field("53", "986") +
    (amount ? field("54", amount.toFixed(2)) : "") +
    field("58", "BR") +
    field("59", normalize(name, 25)) +
    field("60", normalize(city, 15)) +
    field("62", field("05", "***")) +
    "6304";

  return payload + crc16(payload);
}