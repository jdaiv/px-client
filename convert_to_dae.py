import bpy
import os

bpy.ops.wm.collada_export(
    filepath=os.environ["MODEL_EXPORT_PATH"])