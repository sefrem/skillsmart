import atheris

with atheris.instrument_imports():
    from dynamic_array import DynArray
    import sys


def TestOneInput(data):
    fdp = atheris.FuzzedDataProvider(data)

    DynArray().insert(fdp.ConsumeInt(16), fdp.ConsumeString(sys.maxsize))


atheris.Setup(sys.argv, TestOneInput)
atheris.Fuzz()
