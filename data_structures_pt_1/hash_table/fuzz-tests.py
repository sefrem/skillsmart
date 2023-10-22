import atheris

with atheris.instrument_imports():
    from hash_table import HashTable
    import sys


def TestOneInput(data):
    fdp = atheris.FuzzedDataProvider(data)

    table = HashTable(fdp.ConsumeInt(sys.maxsize), fdp.ConsumeInt(sys.maxsize))

    table.seek_slot(fdp.ConsumeString(sys.maxsize))
    table.seek_slot(fdp.ConsumeString(sys.maxsize))
    table.seek_slot(fdp.ConsumeString(sys.maxsize))
    table.seek_slot(fdp.ConsumeString(sys.maxsize))



atheris.Setup(sys.argv, TestOneInput)
atheris.Fuzz()
