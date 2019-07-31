#!/usr/bin/env python3
import os
import subprocess


def convert(srcFormat, destFormat, file):
    srcFile = "src/" + file
    destFile = "extension/" + file.replace(srcFormat, destFormat)
    print("Converting {} to {}".format(srcFile, destFile))
    proc = subprocess.Popen([srcFormat, srcFile, destFile])
    proc.wait()


if __name__ == "__main__":
    srcFiles = os.listdir("src")
    for file in filter(lambda x: x.endswith(".haml"), srcFiles):
        convert("haml", "html", file)

    for file in filter(lambda x: x.endswith(".sass") and not x.startswith("_"), os.listdir("src")):
        convert("sass", "css", file)
