import os

folder = r"C:\base44site\content\articles"

# Bad bytes (mojibake) -> correct UTF-8 bytes
# Each original UTF-8 char got: read as windows-1252, then re-encoded as UTF-8
replacements = [
    # → (U+2192): E2 86 92 -> C3A2 E280A0 E28099
    (b"\xc3\xa2\xe2\x80\xa0\xe2\x80\x99", b"\xe2\x86\x92"),
    # — (U+2014): E2 80 94 -> C3A2 E282AC E2809D
    (b"\xc3\xa2\xe2\x82\xac\xe2\x80\x9d", b"\xe2\x80\x94"),
    # – (U+2013): E2 80 93 -> C3A2 E282AC E2809C
    (b"\xc3\xa2\xe2\x82\xac\xe2\x80\x9c", b"\xe2\x80\x93"),
    # ' (U+2019): E2 80 99 -> C3A2 E282AC E28499... let's check
    # ' right single quote - may appear as â€™
    # E2 80 99 -> E2=C3A2, 80=E282AC, 99=E28499? no...
    # 99 in windows-1252 = TM sign = U+2122
    # Actually in windows-1252: 99 = U+2122, so ' (99) -> TM
    # Hmm, let me skip for now and just handle arrow and dashes
    # " (U+201C): E2 80 9C ->
    # " (U+201D): E2 80 9D ->
]

fixed = 0
for fname in os.listdir(folder):
    if not fname.endswith(".json"):
        continue
    path = os.path.join(folder, fname)
    with open(path, "rb") as f:
        data = f.read()

    new_data = data
    for bad, good in replacements:
        new_data = new_data.replace(bad, good)

    if new_data != data:
        with open(path, "wb") as f:
            f.write(new_data)
        fixed += 1

print(f"Fixed {fixed} files")
