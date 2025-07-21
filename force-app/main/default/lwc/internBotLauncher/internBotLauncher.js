import { LightningElement } from 'lwc';

export default class InternBotLauncher extends LightningElement {
     connectedCallback() {
        this.loadBotScript();
    }

    loadBotScript() {
        const internEmail = sessionStorage.getItem('interndata');
        const script = document.createElement('script');
        script.src = 'https://mitmanipal3-dev-ed.develop.my.site.com/ESWInternWebChat1752938260016/assets/js/bootstrap.min.js';
        script.onload = () => {
            try {
                embeddedservice_bootstrap.settings.language = 'en_US'; // For example, enter 'en' or 'en-US'
               embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({
                internEmail: internEmail || 'guest@intern.com'
            });


			embeddedservice_bootstrap.init(
				'00DWU00000FgGe1',
				'Intern_Web_Chat',
				'https://mitmanipal3-dev-ed.develop.my.site.com/ESWInternWebChat1752938260016',
				{
					scrt2URL: 'https://mitmanipal3-dev-ed.develop.my.salesforce-scrt.com'
				}
			);
            } catch (err) {
                console.error('Error loading Embedded Messaging:', err);
            }
        };
        document.body.appendChild(script);
    }
}