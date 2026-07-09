export const registerGenziteBlocks = (editor: any) => {
    const bm = editor.BlockManager;

    bm.add('navbar', {
      category: 'Sections & Templates',
      label: `
        <div class="gz-block-item">
          <div class="gz-block-icon" style="color: #F97316"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg></div>
          <div class="gz-block-info">
            <div class="gz-block-title">Navigation Bar</div>
            <div class="gz-block-desc">Top header navigation routing menu</div>
          </div>
        </div>
      `,
      content: `<nav style="padding: 20px; background: #fff; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-weight: bold; font-size: 20px; color: #0f172a;">Logo</div>
        <div style="display: flex; gap: 20px;"><a href="#" style="color: #64748b; text-decoration: none; font-weight: 500;">Home</a><a href="#" style="color: #64748b; text-decoration: none; font-weight: 500;">About</a><a href="#" style="color: #64748b; text-decoration: none; font-weight: 500;">Contact</a></div>
      </nav>`,
    });

    bm.add('hero', {
      category: 'Sections & Templates',
      label: `
        <div class="gz-block-item">
          <div class="gz-block-icon" style="color: #06B6D4"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/><path fill="currentColor" d="M5 15h8v2H5zM5 7h14v6H5z"/></svg></div>
          <div class="gz-block-info">
            <div class="gz-block-title">Hero Banner</div>
            <div class="gz-block-desc">Large headline banner to grab attention</div>
          </div>
        </div>
      `,
      content: `<section style="padding: 120px 20px; text-align: center; background: #f8fafc;">
        <h1 style="font-size: 48px; margin-bottom: 20px; color: #0f172a; font-weight: 800; line-height: 1.2;">Welcome to Genzite</h1>
        <p style="font-size: 18px; color: #64748B; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto;">Create professional websites in minutes with our visual drag-and-drop editor.</p>
        <a href="#" style="display: inline-block; padding: 14px 32px; background: #06B6D4; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Get Started</a>
      </section>`,
    });

    bm.add('features', {
      category: 'Sections & Templates',
      label: `
        <div class="gz-block-item">
          <div class="gz-block-icon" style="color: #10B981"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg></div>
          <div class="gz-block-info">
            <div class="gz-block-title">Features Grid</div>
            <div class="gz-block-desc">Display services and key highlights</div>
          </div>
        </div>
      `,
      content: `<section style="padding: 80px 20px; display: flex; gap: 30px; justify-content: center; background: #ffffff;">
        <div style="flex: 1; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <div style="width: 48px; height: 48px; border-radius: 8px; background: #10B981; color: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 24px;">★</div>
          <h3 style="margin-top: 0; color: #0f172a; font-size: 20px; margin-bottom: 12px;">Premium Design</h3>
          <p style="color: #64748b; line-height: 1.6; margin: 0;">Deliver stunning visual experiences across all screen sizes and devices.</p>
        </div>
        <div style="flex: 1; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <div style="width: 48px; height: 48px; border-radius: 8px; background: #F97316; color: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 24px;">⚡</div>
          <h3 style="margin-top: 0; color: #0f172a; font-size: 20px; margin-bottom: 12px;">Lightning Fast</h3>
          <p style="color: #64748b; line-height: 1.6; margin: 0;">Optimized for instant page loading and zero lag.</p>
        </div>
        <div style="flex: 1; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <div style="width: 48px; height: 48px; border-radius: 8px; background: #06B6D4; color: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 24px;">🛡️</div>
          <h3 style="margin-top: 0; color: #0f172a; font-size: 20px; margin-bottom: 12px;">Maximum Security</h3>
          <p style="color: #64748b; line-height: 1.6; margin: 0;">Two-layer enterprise security protecting customer data absolutely.</p>
        </div>
      </section>`,
    });

    bm.add('cta', {
      category: 'Sections & Templates',
      label: `
        <div class="gz-block-item">
          <div class="gz-block-icon" style="color: #8B5CF6"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
          <div class="gz-block-info">
            <div class="gz-block-title">Call to Action (CTA)</div>
            <div class="gz-block-desc">Section encouraging user conversion</div>
          </div>
        </div>
      `,
      content: `<section style="padding: 100px 20px; text-align: center; background: #0f172a; color: #fff;">
        <h2 style="font-size: 36px; margin-bottom: 16px; margin-top: 0;">Ready to scale?</h2>
        <p style="font-size: 18px; color: #94A3B8; margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto;">Join thousands of customers building modern websites with Genzite.</p>
        <a href="#" style="display: inline-block; padding: 14px 32px; background: #06B6D4; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.2s;">Sign Up Today</a>
      </section>`,
    });

    bm.add('pricing', {
      category: 'Sections & Templates',
      label: `
        <div class="gz-block-item">
          <div class="gz-block-icon" style="color: #EC4899"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>
          <div class="gz-block-info">
            <div class="gz-block-title">Pricing Plans</div>
            <div class="gz-block-desc">Comparative product pricing table</div>
          </div>
        </div>
      `,
      content: `<section style="padding: 80px 20px; background: #f8fafc;">
        <div style="text-align: center; margin-bottom: 50px;">
          <h2 style="font-size: 32px; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Pricing Plans</h2>
          <p style="color: #64748b; font-size: 16px;">Choose the plan that fits your exact needs</p>
        </div>
        <div style="display: flex; gap: 30px; justify-content: center; max-width: 1000px; margin: 0 auto;">
          <div style="flex: 1; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; text-align: center;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 20px;">Starter</h3>
            <div style="font-size: 40px; font-weight: bold; color: #0f172a; margin: 20px 0;">$9<span style="font-size: 16px; color: #64748b; font-weight: normal;">/mo</span></div>
            <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; color: #64748b; line-height: 2.5;"><li>1 Website</li><li>1GB Storage</li><li>Email Support</li></ul>
            <a href="#" style="display: block; padding: 12px; background: #f1f5f9; color: #0f172a; text-decoration: none; border-radius: 8px; font-weight: 500;">Choose Plan</a>
          </div>
          <div style="flex: 1; padding: 40px 30px; border: 2px solid #06B6D4; border-radius: 12px; background: #fff; text-align: center; position: relative; transform: translateY(-10px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
            <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #06B6D4; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">POPULAR</div>
            <h3 style="margin-top: 0; color: #0f172a; font-size: 20px;">Pro</h3>
            <div style="font-size: 40px; font-weight: bold; color: #0f172a; margin: 20px 0;">$29<span style="font-size: 16px; color: #64748b; font-weight: normal;">/mo</span></div>
            <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; color: #64748b; line-height: 2.5;"><li>5 Websites</li><li>10GB Storage</li><li>24/7 Priority Support</li></ul>
            <a href="#" style="display: block; padding: 12px; background: #06B6D4; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Choose Plan</a>
          </div>
          <div style="flex: 1; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; text-align: center;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 20px;">Enterprise</h3>
            <div style="font-size: 40px; font-weight: bold; color: #0f172a; margin: 20px 0;">$99<span style="font-size: 16px; color: #64748b; font-weight: normal;">/mo</span></div>
            <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; color: #64748b; line-height: 2.5;"><li>Unlimited Websites</li><li>100GB Storage</li><li>Dedicated Expert Support</li></ul>
            <a href="#" style="display: block; padding: 12px; background: #f1f5f9; color: #0f172a; text-decoration: none; border-radius: 8px; font-weight: 500;">Choose Plan</a>
          </div>
        </div>
      </section>`,
    });

    bm.add('footer', {
      category: 'Sections & Templates',
      label: `
        <div class="gz-block-item">
          <div class="gz-block-icon" style="color: #94A3B8"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></div>
          <div class="gz-block-info">
            <div class="gz-block-title">Footer Section</div>
            <div class="gz-block-desc">Site navigation and copyright info</div>
          </div>
        </div>
      `,
      content: `<footer style="padding: 60px 20px 20px; background: #0B0F19; color: #94A3B8;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 40px; margin-bottom: 40px;">
          <div style="flex: 2; min-width: 250px;">
            <h3 style="color: #fff; font-size: 24px; margin-top: 0; margin-bottom: 20px;">Logo</h3>
            <p style="line-height: 1.6; margin-bottom: 20px;">Modern website building platform helping you create stunning digital experiences without code.</p>
          </div>
          <div style="flex: 1; min-width: 150px;">
            <h4 style="color: #fff; margin-top: 0; margin-bottom: 20px;">Products</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.2;"><li><a href="#" style="color: #94A3B8; text-decoration: none;">Features</a></li><li><a href="#" style="color: #94A3B8; text-decoration: none;">Pricing</a></li><li><a href="#" style="color: #94A3B8; text-decoration: none;">Integrations</a></li></ul>
          </div>
          <div style="flex: 1; min-width: 150px;">
            <h4 style="color: #fff; margin-top: 0; margin-bottom: 20px;">Company</h4>
            <ul style="list-style: none; padding: 0; margin: 0; line-height: 2.2;"><li><a href="#" style="color: #94A3B8; text-decoration: none;">About Us</a></li><li><a href="#" style="color: #94A3B8; text-decoration: none;">Contact</a></li><li><a href="#" style="color: #94A3B8; text-decoration: none;">Blog</a></li></ul>
          </div>
        </div>
        <div style="max-width: 1200px; margin: 0 auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 14px;">
          &copy; 2026 Genzite. All rights reserved.
        </div>
      </footer>`,
    });

    // --- Basic Elements ---
    bm.add('text', {
      category: 'Basic Elements',
      label: `
        <div class="gz-block-item">
          <div class="gz-block-icon" style="color: #94A3B8"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 4v3h5.5v12h3V7H19V4H5z"/></svg></div>
          <div class="gz-block-info">
            <div class="gz-block-title">Text Block</div>
            <div class="gz-block-desc">Insert a paragraph or heading</div>
          </div>
        </div>
      `,
      content: '<div style="padding: 10px;">Enter your text content here</div>',
    });

    bm.add('image', {
      category: 'Basic Elements',
      label: `
        <div class="gz-block-item">
          <div class="gz-block-icon" style="color: #38BDF8"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>
          <div class="gz-block-info">
            <div class="gz-block-title">Image Block</div>
            <div class="gz-block-desc">Insert an image or logo</div>
          </div>
        </div>
      `,
      content: '<img style="max-width: 100%; display: block;" src="https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=600&auto=format&fit=crop" />',
    });

    bm.add('button', {
      category: 'Basic Elements',
      label: `
        <div class="gz-block-item">
          <div class="gz-block-icon" style="color: #A3E635"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"/></svg></div>
          <div class="gz-block-info">
            <div class="gz-block-title">Button</div>
            <div class="gz-block-desc">Interactive call to action button</div>
          </div>
        </div>
      `,
      content: '<a href="#" style="display: inline-block; padding: 12px 24px; background: #06B6D4; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Click Here</a>',
    });

    bm.add('columns', {
      category: 'Basic Elements',
      label: `
        <div class="gz-block-item">
          <div class="gz-block-icon" style="color: #FCD34D"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h8v18H3zm10 0h8v18h-8z"/></svg></div>
          <div class="gz-block-info">
            <div class="gz-block-title">2 Columns</div>
            <div class="gz-block-desc">Two-column grid layout</div>
          </div>
        </div>
      `,
      content: `<div style="display: flex; gap: 20px; padding: 20px;">
        <div style="flex: 1; padding: 20px; min-height: 50px; background: rgba(0,0,0,0.05); border: 1px dashed #ccc;">Column 1</div>
        <div style="flex: 1; padding: 20px; min-height: 50px; background: rgba(0,0,0,0.05); border: 1px dashed #ccc;">Column 2</div>
      </div>`,
    });

};
