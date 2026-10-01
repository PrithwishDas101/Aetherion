const uint32be = (value) =>
  Buffer.from([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);

const mp4Box = (name, data) =>
  Buffer.concat([uint32be(data.length + 8), Buffer.from(name), data]);

const mp4FullBox = (name, data) =>
  mp4Box(name, Buffer.concat([Buffer.alloc(4), data]));

export const jpegFixture = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
]);

export const pngFixture = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/FuoAAAAASUVORK5CYII=",
  "base64",
);

export const webpFixture = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x16, 0x00, 0x00, 0x00,
  0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x58,
  0x0a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

export const pdfFixture = (() => {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 1 1] /Resources << >> /Contents 4 0 R >>",
    "<< /Length 0 >>\nstream\n\nendstream",
  ];
  let document = "%PDF-1.4\n";
  const offsets = [0];

  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(document, "ascii"));
    document += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(document, "ascii");
  document += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    document += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  document += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(document, "ascii");
})();

export const mp4VideoFixture = (() => {
  const handler = mp4FullBox(
    "hdlr",
    Buffer.concat([Buffer.alloc(4), Buffer.from("vide"), Buffer.alloc(12), Buffer.from([0])]),
  );
  const mediaHeader = mp4FullBox("mdhd", Buffer.alloc(20));
  const videoHeader = mp4FullBox(
    "vmhd",
    Buffer.concat([Buffer.from([0, 1]), Buffer.alloc(8)]),
  );
  const url = mp4FullBox("url ", Buffer.from([1]));
  const dataReferences = mp4FullBox(
    "dref",
    Buffer.concat([uint32be(1), url]),
  );
  const dataInformation = mp4Box("dinf", dataReferences);
  const sampleDescription = mp4FullBox("stsd", uint32be(0));
  const sampleTable = mp4Box(
    "stbl",
    Buffer.concat([
      sampleDescription,
      mp4FullBox("stts", uint32be(0)),
      mp4FullBox("stsc", uint32be(0)),
      mp4FullBox("stsz", Buffer.concat([uint32be(0), uint32be(0)])),
      mp4FullBox("stco", uint32be(0)),
    ]),
  );
  const mediaInformation = mp4Box(
    "minf",
    Buffer.concat([videoHeader, dataInformation, sampleTable]),
  );
  const media = mp4Box(
    "mdia",
    Buffer.concat([mediaHeader, handler, mediaInformation]),
  );
  const track = mp4Box(
    "trak",
    Buffer.concat([mp4FullBox("tkhd", Buffer.alloc(80)), media]),
  );
  const movie = mp4Box(
    "moov",
    Buffer.concat([mp4FullBox("mvhd", Buffer.alloc(96)), track]),
  );
  const fileType = mp4Box(
    "ftyp",
    Buffer.concat([Buffer.from("isom"), uint32be(0), Buffer.from("isommp41")]),
  );

  return Buffer.concat([fileType, movie]);
})();

export const oggAudioFixture = Buffer.from([
  0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x01, 0x1e, 0x01, 0x76, 0x6f, 0x72, 0x62, 0x69,
  0x73,
]);

export const zipFixture = Buffer.from([
  0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00,
]);