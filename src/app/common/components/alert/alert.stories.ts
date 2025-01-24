import {
    argsToTemplate,
    Meta,
    moduleMetadata,
    StoryObj,
} from '@storybook/angular';
import { BootstrapModule } from '../../bootstrap/bootstrap.module';
import { Alert } from './alert';

type Content = {
    ngContent: string;
};

const meta: Meta<Alert & Content> = {
    title: 'Common/Components/Alert',
    component: Alert,
    decorators: [moduleMetadata({ imports: [BootstrapModule] })],
    argTypes: {
        type: {
            control: 'select',
            options: ['info', 'warning', 'error'],
        },
        title: {
            control: 'text',
        },
        ngContent: {
            control: 'text',
        },
    },
    args: {
        ngContent: '<p>Lorem ipsum dolor sit amet</p>',
    },
    render: ({ ngContent, ...args }) => ({
        props: args,
        template: `
            <alert ${argsToTemplate(args)}>
                ${ngContent}
            </alert>`,
    }),
};

export default meta;
type Story = StoryObj<Alert & Content>;

export const Info: Story = {
    args: {
        type: 'info',
        title: 'Alert title',
    },
};

export const Warning: Story = {
    args: {
        type: 'warning',
        title: 'Alert title',
    },
};

export const Error: Story = {
    args: {
        type: 'error',
        title: 'Alert title',
    },
};
