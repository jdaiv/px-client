import bpy
import os

bpy.ops.export_scene.gltf(
    filepath=os.environ["MODEL_EXPORT_PATH"],
    export_copyright='John Aivaliotis 2019',
    export_format='GLTF_EMBEDDED',
    export_materials=False)