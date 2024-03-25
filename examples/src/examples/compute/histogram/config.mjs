/**
 * @type {import('../../../../types.mjs').ExampleConfig}
 */
export default {
    HIDDEN: true,
    WEBGPU_REQUIRED: true,
    FILES: {
        'compute-shader.wgsl': /* wgsl */ `

            @group(0) @binding(0) var inputTexture: texture_2d<f32>;
            // @group(0) @binding(1) is a sampler of the inputTexture, but we don't need it in the shader.
            @group(0) @binding(2) var<storage, read_write> bins: array<atomic<u32>>;
    
            fn luminance(color: vec3f) -> f32 {
                return saturate(dot(color, vec3f(0.2126, 0.7152, 0.0722)));
            }
            
            @compute @workgroup_size(1, 1, 1)
            fn main(@builtin(global_invocation_id) global_invocation_id: vec3u) {
                let numBins = f32(arrayLength(&bins));
                let lastBinIndex = u32(numBins - 1);
                let position = global_invocation_id.xy;
                let color = textureLoad(inputTexture, position, 0);
                let v = luminance(color.rgb);
                let bin = min(u32(v * numBins), lastBinIndex);
                //bins[bin] += 1;
                atomicAdd(&bins[bin], 1u);
            }
        `
    }
};
